import { relations } from "drizzle-orm";
import { integer, primaryKey, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { budgets } from "./budgets";
import { category_table } from "./categories";

export const budgetsToCategories = pgTable(
  "budgets_to_categories",
  {
    budgetId: integer()
      .notNull()
      .references(() => budgets.id),
    categoryId: varchar({ length: 128 })
      .notNull()
      .references(() => category_table.id),

    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.budgetId, t.categoryId] })],
);

export const budgetsToCategoriesRelations = relations(
  budgetsToCategories,
  ({ one }) => ({
    budget: one(budgets, {
      fields: [budgetsToCategories.budgetId],
      references: [budgets.id],
    }),
    category: one(category_table, {
      fields: [budgetsToCategories.categoryId],
      references: [category_table.id],
    }),
  }),
);
