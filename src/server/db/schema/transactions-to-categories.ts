import { isNotNull, or, relations } from "drizzle-orm";
import { check, primaryKey, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { category_table } from "./categories";
import { transaction_table } from "./transactions";

export const transactionsToCategories = pgTable(
  "transactions_to_categories",
  {
    orgId: varchar({ length: 32 }),
    userId: varchar({ length: 32 }),
    transactionId: varchar({ length: 128 })
      .notNull()
      .references(() => transaction_table.id),
    categoryId: varchar({ length: 128 })
      .notNull()
      .references(() => category_table.id),

    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.transactionId, t.categoryId] }),
    check("org_id_or_user_id", or(isNotNull(t.orgId), isNotNull(t.userId))!),
  ],
);

export const transactionsToCategoriesRelations = relations(
  transactionsToCategories,
  ({ one }) => ({
    transaction: one(transaction_table, {
      fields: [transactionsToCategories.transactionId],
      references: [transaction_table.id],
    }),
    category: one(category_table, {
      fields: [transactionsToCategories.categoryId],
      references: [category_table.id],
    }),
  }),
);
