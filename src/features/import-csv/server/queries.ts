"server-only";

import type { DBClient } from "~/server/db";
import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import { db } from "~/server/db";
import { transaction_table } from "~/server/db/schema/transactions";

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
