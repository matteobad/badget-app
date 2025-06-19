import { createId } from "@paralleldrive/cuid2";

import { timestamps, timezoneRange } from "../utils";
import { pgTable } from "./_table";
import { category_table } from "./categories";
import { type BudgetPeriod } from "./enum";

export const budget_table = pgTable("budget_table", (d) => ({
  id: d
    .varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  categoryId: d
    .varchar({ length: 128 })
    .references(() => category_table.id, {
      onDelete: "cascade",
    })
    .notNull(),
  userId: d.varchar({ length: 32 }),

  amount: d.numeric({ precision: 10, scale: 2 }).$type<number>().notNull(), // Budgeted amount
  period: d.text().$type<BudgetPeriod>().notNull(),
  sysPeriod: timezoneRange({ notNull: true, default: true }),

  ...timestamps,
}));

export type DB_BudgetType = typeof budget_table.$inferSelect;
export type DB_BudgetInsertType = typeof budget_table.$inferInsert;
