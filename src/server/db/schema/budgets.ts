import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pgEnum } from "drizzle-orm/pg-core";

import { timestamps, timezoneRange } from "../utils";
import { pgTable } from "./_table";
import { category_table } from "./categories";
import { BUDGET_RECURRENCE } from "./enum";

export const recurrenceEnum = pgEnum("recurrence", BUDGET_RECURRENCE);

export const budget_table = pgTable("budget_table", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),

  categoryId: d
    .varchar({ length: 128 })
    .references(() => category_table.id, {
      onDelete: "cascade",
    })
    .notNull(),
  userId: d.varchar({ length: 32 }),

  // tsrange — validità della singola istanza (o prima ricorrenza)
  validity: timezoneRange({ notNull: true, default: true }),

  // Ricorrenza: se null = budget singolo
  recurrence: recurrenceEnum(),
  recurrenceEnd: d.timestamp({ mode: "date" }),

  // Override: puntatore al budget ricorrente a cui fa override
  overrideForBudgetId: d
    .uuid()
    .references((): AnyPgColumn => budget_table.id, { onDelete: "cascade" }),

  amount: d.integer().notNull(), // in centesimi

  ...timestamps,
}));

export const budgetsRelations = relations(budget_table, ({ one }) => ({
  overrideFor: one(budget_table, {
    fields: [budget_table.overrideForBudgetId],
    references: [budget_table.id],
  }),
}));

export type DB_BudgetType = typeof budget_table.$inferSelect;
export type DB_BudgetInsertType = typeof budget_table.$inferInsert;
