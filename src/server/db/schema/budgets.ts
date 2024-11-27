import { relations } from "drizzle-orm";
import { decimal, integer, serial, text, timestamp } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { categories } from "./categories";
import { type BudgetPeriod } from "./enum";

export const budgets = pgTable("budgets", {
  id: serial().primaryKey(),

  // FK
  categoryId: integer()
    .references(() => categories.id)
    .notNull(),

  budget: decimal({ precision: 10, scale: 2 }).default("0"),
  period: text().$type<BudgetPeriod>().notNull(),
  activeFrom: timestamp({ withTimezone: true }).notNull(),

  ...timestamps,
});

export const budgetsRelations = relations(budgets, ({ one }) => ({
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));
