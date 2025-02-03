"server-only";

import { type TransactionInsertSchema } from "~/lib/validators/transactions";
import { db } from "..";
import { transaction_table } from "../schema/transactions";

export function createTransactionMutation(data: TransactionInsertSchema) {
  return db.insert(transaction_table).values(data);
}
