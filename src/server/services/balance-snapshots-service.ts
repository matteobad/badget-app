import { addDays } from "date-fns";
import { and, desc, eq, sql } from "drizzle-orm";

import type { DBClient } from "../db";
import type { DB_BalanceSnapshotInsertType } from "../db/schema/accounts";
import { account_table, balance_snapshot_table } from "../db/schema/accounts";
import { transaction_table } from "../db/schema/transactions";
import { calculateDailyBalance } from "../domain/transaction/utils";

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
