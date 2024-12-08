import { relations } from "drizzle-orm";
import { integer, primaryKey } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { budgets } from "./budgets";
import { categories } from "./categories";

export const budgetsToCategories = pgTable(
  "budgets_to_categories",
  {
    budgetId: integer()
      .notNull()
      .references(() => budgets.id),
    categoryId: integer()
      .notNull()
      .references(() => categories.id),

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
    category: one(categories, {
      fields: [budgetsToCategories.categoryId],
      references: [categories.id],
    }),
  }),
);
