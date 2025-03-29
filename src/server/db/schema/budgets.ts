import { createId } from "@paralleldrive/cuid2";
import { decimal, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { category_table } from "./categories";
import { type BudgetPeriod } from "./enum";

export const budget_table = pgTable("budget_table", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  categoryId: varchar({ length: 128 }).references(() => category_table.id, {
    onDelete: "cascade",
  }),
  userId: varchar({ length: 32 }),

  name: text().notNull(), // Example: "Groceries Budget"
  amount: decimal({ precision: 10, scale: 2 }).notNull(), // Budgeted amount
  period: text().$type<BudgetPeriod>().notNull(),
  startDate: timestamp().notNull(), // When budget starts
  endDate: timestamp().notNull(), // When budget ends

  ...timestamps,
});

export type DB_BudgetType = typeof budget_table.$inferSelect;
export type DB_BudgetInsertType = typeof budget_table.$inferInsert;
