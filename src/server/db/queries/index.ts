"server-only";

import { eq } from "drizzle-orm";

import { type TransactionInsertSchema } from "~/lib/validators/transactions";
import { db } from "..";
import { account_table as accountSchema } from "../schema/accounts";
import { category_table as categorySchema } from "../schema/categories";
import { transaction_table } from "../schema/transactions";

export const QUERIES = {
  getAccountsForUser: function (userId: string) {
    return db
      .select()
      .from(accountSchema)
      .where(eq(accountSchema.userId, userId))
      .orderBy(accountSchema.name);
  },

  getCategoriesForUser: function (userId: string) {
    return db
      .select()
      .from(categorySchema)
      .where(eq(categorySchema.userId, userId))
      .orderBy(categorySchema.name);
  },
};

export function createTransactionMutation(data: TransactionInsertSchema) {
  return db.insert(transaction_table).values(data);
}
