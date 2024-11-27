import { relations } from "drizzle-orm";
import { integer, primaryKey } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { categories } from "./categories";
import { transactions } from "./transactions";

export const transactionsToCategories = pgTable(
  "transactions_to_categories",
  {
    transactionId: integer()
      .notNull()
      .references(() => transactions.id),
    categoryId: integer()
      .notNull()
      .references(() => categories.id),

    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.transactionId, t.categoryId] })],
);

export const transactionsToCategoriesRelations = relations(
  transactionsToCategories,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionsToCategories.transactionId],
      references: [transactions.id],
    }),
    category: one(categories, {
      fields: [transactionsToCategories.categoryId],
      references: [categories.id],
    }),
  }),
);
