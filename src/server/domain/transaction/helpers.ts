import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { transaction_table } from "~/server/db/schema/transactions";
import { Cookies } from "~/shared/constants/cookies";
import { and, eq, inArray } from "drizzle-orm";

import { normalizeDescription, validateTransaction } from "./utils";

export async function getInitialTransactionsColumnVisibility() {
  const cookieStore = await cookies();

  const columnsToHide = ["tags", "method", "counterparty"];

  const savedColumns = cookieStore.get(Cookies.TransactionsColumns)?.value;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return savedColumns
    ? JSON.parse(savedColumns)
    : columnsToHide.reduce(
        (acc, col) => {
          acc[col] = false;
          return acc;
        },
        {} as Record<string, boolean>,
      );
}

/**
 * Deduplicate transactions against existing ones
 */
export async function deduplicateTransactions(
  transactions: DB_TransactionInsertType[],
  accountId: string,
) {
  if (transactions.length === 0) {
    return { newTransactions: [], duplicateTransactions: [] };
  }

  // Get existing fingerprints
  const fingerprints = transactions.map((t) => t.fingerprint);
  const existingTransactions = await db
    .select({ fingerprint: transaction_table.fingerprint })
    .from(transaction_table)
    .where(
      and(
        eq(transaction_table.accountId, accountId),
        inArray(transaction_table.fingerprint, fingerprints),
      ),
    );

  const existingFingerprints = new Set(
    existingTransactions.map((t) => t.fingerprint),
  );

  const newTransactions: DB_TransactionInsertType[] = [];
  const duplicateTransactions: DB_TransactionInsertType[] = [];

  for (const transaction of transactions) {
    if (existingFingerprints.has(transaction.fingerprint)) {
      duplicateTransactions.push(transaction);
    } else {
      newTransactions.push(transaction);
    }
  }

  return { newTransactions, duplicateTransactions };
}

/**
 * Validate transactions against account rules
 */
export async function validateTransactions(
  transactions: DB_TransactionInsertType[],
  accountId: string,
) {
  const [account] = await db
    .select()
    .from(account_table)
    .where(eq(account_table.id, accountId))
    .limit(1);

  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }

  const valid: DB_TransactionInsertType[] = [];
  const rejected: Array<{
    transaction: DB_TransactionInsertType;
    reason: string;
  }> = [];

  for (const transaction of transactions) {
    const validation = validateTransaction(
      {
        accountId: transaction.accountId,
        amount: transaction.amount,
        date: new Date(transaction.date),
        descriptionNormalized: normalizeDescription(transaction.name),
      },
      account,
      true,
    ); // true = CSV import

    if (validation.valid) {
      valid.push(transaction);
    } else {
      rejected.push({
        transaction,
        reason: validation.reason ?? "Unknown validation error",
      });
    }
  }

  return { validTransactions: valid, invalidTransactions: rejected };
}
