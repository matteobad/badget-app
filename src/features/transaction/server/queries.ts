"server-only";

import type { DBClient } from "~/server/db";
import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { category_table } from "~/server/db/schema/categories";
import {
  attachment_table,
  transaction_table,
} from "~/server/db/schema/transactions";
import { and, desc, eq, getTableColumns } from "drizzle-orm";

export function getRecentTransactions_QUERY(userId: string) {
  try {
    return db
      .select({
        ...getTableColumns(transaction_table),
        account: account_table,
        category: category_table,
      })
      .from(transaction_table)
      .leftJoin(
        category_table,
        eq(transaction_table.categoryId, category_table.id),
      )
      .leftJoin(
        account_table,
        eq(transaction_table.accountId, account_table.id),
      )
      .where(eq(transaction_table.userId, userId))
      .limit(9)
      .orderBy(desc(transaction_table.date));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export const createTransaction = (
  transaction: DB_TransactionInsertType,
  client: DBClient = db,
) => {
  if (!transaction.userId) throw new Error("invalid transaction");

  return client
    .insert(transaction_table)
    .values(transaction)
    .returning({ id: transaction_table.id });
};

export const updateTransaction = (
  transaction: Partial<DB_TransactionInsertType>,
  client: DBClient = db,
) => {
  if (!transaction.id || !transaction.userId)
    throw new Error("invalid transaction");

  return client
    .update(transaction_table)
    .set(transaction)
    .where(
      and(
        eq(transaction_table.id, transaction.id),
        eq(transaction_table.userId, transaction.userId),
      ),
    );
};

export const deleteTransaction = (
  id: string,
  userId: string,
  client: DBClient = db,
) => {
  return client
    .delete(transaction_table)
    .where(
      and(eq(transaction_table.id, id), eq(transaction_table.userId, userId)),
    );
};

export const deleteTransactionAttachment = (
  id: string,
  userId: string,
  client: DBClient = db,
) => {
  return client
    .delete(attachment_table)
    .where(
      and(eq(attachment_table.id, id), eq(attachment_table.userId, userId)),
    );
};
