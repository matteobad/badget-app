import { isNotNull, or, relations } from "drizzle-orm";
import { check, integer, primaryKey, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { categories } from "./categories";
import { transactions } from "./transactions";

export const transactionsToCategories = pgTable(
  "transactions_to_categories",
  {
    orgId: varchar({ length: 32 }),
    userId: varchar({ length: 32 }),
    transactionId: integer()
      .notNull()
      .references(() => transactions.id),
    categoryId: integer()
      .notNull()
      .references(() => categories.id),

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
