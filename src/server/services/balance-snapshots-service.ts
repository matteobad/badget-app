import { addDays } from "date-fns";
import { and, desc, eq, lt, sql, sum } from "drizzle-orm";

import type { DBClient } from "../db";
import type { DB_BalanceSnapshotInsertType } from "../db/schema/accounts";
import {
  account_table,
  balance_offset_table,
  balance_snapshot_table,
} from "../db/schema/accounts";
import { transaction_table } from "../db/schema/transactions";
import {
  applyOffset,
  calculateDailyBalance,
} from "../domain/transaction/utils";

/**
 * Insert transactions in batch and handle offsets
 */
export async function adjustBalanceOffsets(
  client: DBClient,
  input: {
    accountId: string;
    fromDate: Date;
  },
  organizationId: string,
) {
  const { accountId } = input;

  // Get account details
  const [account] = await client
    .select()
    .from(account_table)
    .where(
      and(
        eq(account_table.id, accountId),
        eq(account_table.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }

  let updatedOffset = false;

  // If manual account with t0, collect posted tx strictly before t0 (date-only)
  const transactionsBeforeT0 = account.t0Datetime
    ? await client
        .select()
        .from(transaction_table)
        .where(
          and(
            eq(transaction_table.accountId, accountId),
            eq(transaction_table.organizationId, organizationId),
          ),
        )
        .orderBy(transaction_table.date)
    : [];

  if (account.manual && account.t0Datetime) {
    const t0DateStr = new Date(account.t0Datetime).toISOString().split("T")[0]!;

    // Only posted and strictly before t0 date
    const beforeT0Posted = transactionsBeforeT0
      .filter((t) => t.status === "posted" && t.date < t0DateStr)
      .map((t) => ({
        amount: t.amount,
        date: new Date(t.date),
      }));

    // When no transactions before t0 nothing to do here
    if (beforeT0Posted.length === 0) return { updatedOffset: false };

    const newOffset = applyOffset(
      accountId,
      new Date(account.t0Datetime),
      account.openingBalance ?? 0,
      beforeT0Posted,
    );

    // Upsert the offset using the same client (transaction-aware)
    await client
      .insert(balance_offset_table)
      .values({
        organizationId,
        accountId,
        effectiveDatetime: newOffset.effectiveDatetime.toISOString(),
        amount: newOffset.amount,
      })
      .onConflictDoUpdate({
        target: [
          balance_offset_table.accountId,
          balance_offset_table.effectiveDatetime,
        ],
        set: {
          amount: newOffset.amount,
        },
      });

    updatedOffset = true;
  }

  return { updatedOffset };
}

/**
 * Update balance and handle offsets
 */
export async function upsertBalanceOffsets(
  db: DBClient,
  input: {
    accountId: string;
    fromDate: Date;
    targetBalance: number;
  },
  organizationId: string,
) {
  const { accountId } = input;

  // Get account details
  const [account] = await db
    .select()
    .from(account_table)
    .where(
      and(
        eq(account_table.id, accountId),
        eq(account_table.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }

  if (!account.manual) {
    throw new Error(`Account ${accountId} is not manually managed`);
  }

  if (!account.openingBalance) {
    throw new Error(`Account ${accountId} have no opening balance`);
  }

  // Collect posted tx strictly before date
  const [transactionsTotalBeforeDate] = await db
    .select({
      value: sum(transaction_table.amount).mapWith(Number),
    })
    .from(transaction_table)
    .where(
      and(
        eq(transaction_table.accountId, accountId),
        eq(transaction_table.organizationId, organizationId),
        eq(transaction_table.status, "posted"),
        lt(transaction_table.date, input.fromDate.toISOString()),
      ),
    );

  // Collect all offsets up to date
  const [offsetsTotalBeforeDate] = await db
    .select({
      value: sum(balance_offset_table.amount).mapWith(Number),
    })
    .from(balance_offset_table)
    .where(
      and(
        eq(balance_offset_table.accountId, accountId),
        eq(balance_offset_table.organizationId, organizationId),
        lt(
          balance_offset_table.effectiveDatetime,
          input.fromDate.toISOString(),
        ),
      ),
    );

  // When no transactions before t0 nothing to do here
  if (!transactionsTotalBeforeDate && !offsetsTotalBeforeDate)
    return { updatedOffset: false };

  // Compute new offset
  const newOffsetAmount =
    input.targetBalance -
    account.openingBalance +
    (transactionsTotalBeforeDate?.value ?? 0) +
    (offsetsTotalBeforeDate?.value ?? 0);

  // Upsert the offset using the same client (transaction-aware)
  await db
    .insert(balance_offset_table)
    .values({
      organizationId,
      accountId,
      effectiveDatetime: input.fromDate.toISOString(),
      amount: newOffsetAmount,
    })
    .onConflictDoUpdate({
      target: [
        balance_offset_table.accountId,
        balance_offset_table.effectiveDatetime,
      ],
      set: {
        amount: newOffsetAmount,
      },
    });

  return { updatedOffset: true };
}

/**
 * Recalculate snapshots from a given date onwards
 * This is the core function that maintains balance consistency
 */
export async function recalculateSnapshots(
  client: DBClient,
  input: {
    accountId: string;
    fromDate: Date;
  },
  organizationId: string,
) {
  const { accountId, fromDate } = input;

  // Get account details
  const account = await client
    .select()
    .from(account_table)
    .where(
      and(
        eq(account_table.id, accountId),
        eq(account_table.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!account[0]) {
    throw new Error(`Account ${accountId} not found`);
  }

  const accountData = account[0];

  // Get all transactions for this account
  const transactions = await client
    .select()
    .from(transaction_table)
    .where(
      and(
        eq(transaction_table.accountId, accountId),
        eq(transaction_table.organizationId, organizationId),
      ),
    )
    .orderBy(transaction_table.date);

  // Get all balance offsets for this account
  const offsets = await client
    .select()
    .from(balance_offset_table)
    .where(
      and(
        eq(balance_offset_table.accountId, accountId),
        eq(balance_offset_table.organizationId, organizationId),
      ),
    )
    .orderBy(balance_offset_table.effectiveDatetime);

  // Calculate snapshots day by day from fromDate to today
  const balances: DB_BalanceSnapshotInsertType[] = [];
  const today = new Date();
  let currentDate = new Date(fromDate);

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split("T")[0]!;

    // Calculate the computed balance for this date
    const computedBalance = calculateDailyBalance(
      currentDate,
      accountData,
      transactions,
      offsets.map((o) => ({
        effectiveDatetime: new Date(o.effectiveDatetime),
        amount: o.amount,
      })),
    );

    balances.push({
      organizationId: accountData.organizationId,
      accountId: accountId,
      date: dateStr,
      closingBalance: computedBalance,
      currency: accountData.currency,
      source: "derived",
    });

    currentDate = addDays(currentDate, 1);
  }

  if (balances.length === 0) {
    return;
  }

  // Upsert the snapshots (derived or API)
  await client
    .insert(balance_snapshot_table)
    .values(balances)
    .onConflictDoUpdate({
      target: [balance_snapshot_table.accountId, balance_snapshot_table.date],
      set: {
        closingBalance: sql`excluded.closing_balance`,
        source: sql`excluded.source`,
      },
    });
}

/**
 * Force recalculation of all snapshots for an account
 * Useful for data migration or fixing inconsistencies
 */
export async function forceRecalculateAllSnapshots(
  client: DBClient,
  input: { accountId: string },
  organizationId: string,
) {
  const { accountId } = input;

  // Get the earliest transaction date as the starting point
  const earliestTransaction = await client
    .select({ date: transaction_table.date })
    .from(transaction_table)
    .where(
      and(
        eq(transaction_table.accountId, accountId),
        eq(transaction_table.organizationId, organizationId),
      ),
    )
    .orderBy(transaction_table.date)
    .limit(1);

  const fromDate =
    earliestTransaction.length > 0
      ? new Date(earliestTransaction[0]!.date)
      : new Date(); // If no transactions, start from today

  await recalculateSnapshots(client, { accountId, fromDate }, organizationId);
}

/**
 * Update account balance to reflect current state
 * This should be called after any transaction modifications
 */
export async function updateAccountBalance(
  client: DBClient,
  input: { accountId: string },
  organizationId: string,
) {
  // Get the latest snapshot
  const latestSnapshot = await client
    .select()
    .from(balance_snapshot_table)
    .where(
      and(
        eq(balance_snapshot_table.accountId, input.accountId),
        eq(balance_snapshot_table.organizationId, organizationId),
      ),
    )
    .orderBy(desc(balance_snapshot_table.date))
    .limit(1);

  if (latestSnapshot.length > 0) {
    // Update the account balance
    await client
      .update(account_table)
      .set({ balance: latestSnapshot[0]!.closingBalance })
      .where(
        and(
          eq(account_table.id, input.accountId),
          eq(account_table.organizationId, organizationId),
        ),
      );
  }
}
