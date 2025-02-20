import { createId } from "@paralleldrive/cuid2";
import { date, decimal, text, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { category_table } from "./categories";
import { type BudgetPeriod } from "./enum";
import { tag_table } from "./transactions";

export const budget_table = pgTable("budget_table", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  userId: varchar({ length: 32 }),
  name: text().notNull(), // Example: "Groceries Budget"
  amount: decimal({ precision: 10, scale: 2 }).notNull(), // Budgeted amount
  period: text().$type<BudgetPeriod>().notNull(),
  startDate: date().notNull(), // When budget starts
  endDate: date().notNull(), // When budget ends

  ...timestamps,
});

export type DB_BudgetType = typeof budget_table.$inferSelect;
export type DB_BudgetInsertType = typeof budget_table.$inferInsert;

// Budget Categories (One-to-Many: Budgets → Categories)
export const budget_to_category_table = pgTable("budget_to_category_table", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  budgetId: varchar({ length: 128 })
    .notNull()
    .references(() => budget_table.id, { onDelete: "cascade" }),
  categoryId: varchar({ length: 128 })
    .notNull()
    .references(() => category_table.id, { onDelete: "cascade" }),

  ...timestamps,
});

// Budget Tags (One-to-Many: Budgets → Tags)
export const budget_to_tag_table = pgTable("budget_to_tag_table", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  budgetId: varchar({ length: 128 })
    .notNull()
    .references(() => budget_table.id, {
      onDelete: "cascade",
    }),
  tagId: varchar({ length: 128 })
    .notNull()
    .references(() => tag_table.id, { onDelete: "cascade" }),

  ...timestamps,
});
