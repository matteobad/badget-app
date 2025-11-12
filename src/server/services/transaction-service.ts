import {
  addDays,
  eachDayOfInterval,
  format,
  isAfter,
  min,
  subDays,
} from "date-fns";
import { and, asc, eq, lte, sql } from "drizzle-orm";
import type z from "zod";
import type {
  categorizeTransactionSchema,
  createTransactionSchema,
  deleteManyTransactionsSchema,
  deleteTransactionSchema,
  updateTransactionSchema,
  updateTransactionsSchema,
} from "~/shared/validators/transaction.schema";
import type { DBClient } from "../db";
import { db } from "../db";
import { account_table, balance_snapshot_table } from "../db/schema/accounts";
import { transaction_table } from "../db/schema/transactions";
import {
  deleteManyTransactionsMutation,
  updateManyTransactionsMutation,
  updateTransactionMutation,
} from "../domain/transaction/mutations";
import {
  getTransactionAccountCountsQuery,
  getTransactionAmountRangeQuery,
  getTransactionCategoryCountsQuery,
  getTransactionTagCountsQuery,
} from "../domain/transaction/queries";
import {
  calculateFingerprint,
  normalizeDescription,
} from "../domain/transaction/utils";
import {
  recalculateSnapshots,
  updateAccountBalance,
} from "./balance-snapshots-service";

export async function getTransactionAmountRange(orgId: string) {
  return await getTransactionAmountRangeQuery(orgId);
}

export async function getTransactionCategoryCounts(orgId: string) {
  return await getTransactionCategoryCountsQuery(orgId);
}

export async function getTransactionTagsCounts(orgId: string) {
  return await getTransactionTagCountsQuery(orgId);
}

export async function getTransactionAccountCounts(orgId: string) {
  return await getTransactionAccountCountsQuery(orgId);
}

/**
 * Create a manual transaction
 */
export async function createTransaction(
  db: DBClient,
  params: z.infer<typeof createTransactionSchema>,
  organizationId: string,
) {
  const { bankAccountId, ...rest } = params;

  const [bankAccount] = await db
    .select()
    .from(account_table)
    .where(eq(account_table.id, bankAccountId))
    .limit(1);

  if (!bankAccount) {
    throw new Error("ACCOUNT_NOT_FOUND");
  }

  if (bankAccount.organizationId !== organizationId) {
    throw new Error("INVALID_ACCOUNT_PERMISSION");
  }

  const transactionDate = new Date(params.date);
  const accountDate = new Date(bankAccount.t0Datetime!);

  if (
    params.source !== "api" &&
    !bankAccount.manual &&
    isAfter(transactionDate, accountDate)
  ) {
    throw new Error("INVALID_TRANSACTION_CONNECTED_ACCOUNT");
  }

  const fingerprint = calculateFingerprint({
    accountId: bankAccountId,
    amount: params.amount,
    date: transactionDate,
    descriptionNormalized: normalizeDescription(params.name),
  });

  const [existing] = await db
    .select()
    .from(transaction_table)
    .where(eq(transaction_table.fingerprint, fingerprint))
    .limit(1);

  if (existing) {
    throw new Error("TRANSACTION_FINGERPRINT_CONFLICT");
  }

  const [transaction] = await db
    .insert(transaction_table)
    .values({
      ...rest,
      accountId: bankAccountId,
      fingerprint,
      organizationId,
    })
    .returning();

  if (!transaction) {
    throw new Error("TRANSACTION_INSERT_ERROR");
  }

  if (!bankAccount.manual) {
    const [snapshot] = await db
      .select()
      .from(balance_snapshot_table)
      .where(
        and(
          eq(transaction_table.organizationId, organizationId),
          eq(transaction_table.accountId, bankAccountId),
          eq(transaction_table.date, format(accountDate, "yyyy-MM-dd")),
        ),
      )
      .limit(1);

    const transactions = await db
      .select()
      .from(transaction_table)
      .where(
        and(
          eq(transaction_table.organizationId, organizationId),
          eq(transaction_table.accountId, bankAccountId),
          lte(transaction_table.date, format(accountDate, "yyyy-MM-dd")),
        ),
      )
      .orderBy(asc(transaction_table.date));

    const initialBalance = snapshot!.closingBalance;
    const firstTransactionDate = new Date(transactions[0]!.date);
    const snapshotsInterval = eachDayOfInterval({
      start: subDays(firstTransactionDate, 1),
      end: subDays(accountDate, 1),
    });

    let closingBalance = initialBalance;
    const snapshots = snapshotsInterval.map((date) => {
      const dateString = format(addDays(date, 1), "yyyy-MM-dd");
      const txs = transactions.filter((t) => t.date === dateString);
      const txsBalance = txs.reduce((tot, t) => tot + t.amount, 0);
      closingBalance = closingBalance - txsBalance;

      return {
        organizationId,
        accountId: bankAccountId,
        date: dateString,
        closingBalance: closingBalance,
        currency: bankAccount.currency,
      };
    });

    await db
      .insert(balance_snapshot_table)
      .values(snapshots)
      .onConflictDoUpdate({
        target: [balance_snapshot_table.accountId, balance_snapshot_table.date],
        set: {
          closingBalance: sql.raw(
            `excluded.${balance_snapshot_table.closingBalance}`,
          ),
          source: "derived",
        },
      });
  }

  if (bankAccount.manual && isAfter(transactionDate, accountDate)) {
    // TODO: update balance and snapshots for manual account
  }

  return transaction;
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  db: DBClient,
  input: z.infer<typeof updateTransactionSchema>,
  organizationId: string,
) {
  // Get existing transaction
  const [existing] = await db
    .select()
    .from(transaction_table)
    .where(eq(transaction_table.id, input.id))
    .limit(1);

  if (!existing) {
    throw new Error(`Transaction ${input.id} not found`);
  }

  // Validate organization ownership
  if (existing.organizationId !== organizationId) {
    throw new Error("Transaction not found");
  }

  // Update fingerprint -> amount || date || name - change
  console.debug("[transaction-service] computing transaction fingerprint");
  const fingerprint = calculateFingerprint({
    accountId: input.bankAccountId ?? existing.accountId,
    amount: input.amount ?? existing.amount,
    date: new Date(input.date ?? existing.date),
    descriptionNormalized: normalizeDescription(input.name ?? existing.name),
  });

  return await db.transaction(async (tx) => {
    console.debug("[transaction-service] updating transaction");
    const updated = await updateTransactionMutation(db, {
      ...input,
      fingerprint,
      organizationId,
    });

    if (input.date || (input.amount && input.amount !== existing.amount)) {
      // Recalculate snpshots -> date || amount - change
      const affectedDate = min([
        input.date ? new Date(input.date) : new Date(),
        new Date(existing.date),
      ]);

      console.debug("[transaction-service] recalculating snapshots");
      await recalculateSnapshots(
        tx,
        {
          accountId: input.bankAccountId ?? existing.accountId,
          fromDate: affectedDate,
        },
        organizationId,
      );
    }

    if (input.amount && input.amount !== existing.amount) {
      // Update balance -> amount - change
      console.debug("[transaction-service] updating account balance");
      await updateAccountBalance(
        tx,
        { accountId: input.bankAccountId ?? existing.accountId },
        organizationId,
      );
    }

    // TODO: update embedding -> name - change

    return updated;
  });
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  client: DBClient,
  input: z.infer<typeof deleteTransactionSchema>,
  organizationId: string,
) {
  return client.transaction(async (tx) => {
    // Get existing transaction
    const existing = await tx
      .select()
      .from(transaction_table)
      .where(eq(transaction_table.id, input.id))
      .limit(1);

    if (!existing[0]) {
      throw new Error(`Transaction ${input.id} not found`);
    }

    const existingTransaction = existing[0];

    // Validate organization ownership
    if (existingTransaction.organizationId !== organizationId) {
      throw new Error("Transaction not found");
    }

    // Check if it's part of a transfer
    if (existingTransaction.transferId) {
      const transferTransactions = await tx
        .select()
        .from(transaction_table)
        .where(
          eq(transaction_table.transferId, existingTransaction.transferId),
        );

      if (transferTransactions.length > 1) {
        throw new Error(
          "Cannot delete individual transaction from a transfer. Delete the entire transfer instead.",
        );
      }
    }

    // Delete the transaction
    await tx
      .delete(transaction_table)
      .where(eq(transaction_table.id, input.id));

    // Recalculate snapshots from the transaction date
    const affectedDate = new Date(existingTransaction.date);

    // TODO: if removing last first transaction we should 0-out
    // the spashots until the new first transactions
    await recalculateSnapshots(
      tx,
      { accountId: existingTransaction.accountId, fromDate: affectedDate },
      organizationId,
    );

    // Update account balance
    await updateAccountBalance(
      tx,
      { accountId: existingTransaction.accountId },
      organizationId,
    );
  });
}

export async function updateManyTransactions(
  client: DBClient,
  input: z.infer<typeof updateTransactionsSchema>,
  organizationId: string,
) {
  return client.transaction(async (tx) => {
    return await updateManyTransactionsMutation(tx, {
      ...input,
      organizationId,
    });
  });
}

export async function deleteManyTransactions(
  input: z.infer<typeof deleteManyTransactionsSchema>,
  orgId: string,
) {
  return await deleteManyTransactionsMutation(db, {
    ...input,
    orgId,
  });
}

export async function categorizeTransaction(
  input: z.infer<typeof categorizeTransactionSchema>,
  orgId: string,
) {
  return await categorizeTransaction(input, orgId);
}
