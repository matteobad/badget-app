import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgMaterializedView,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { BUDGET_RECURRENCE } from "../../../shared/constants/enum";
import { timestamps, timezoneRange } from "../utils";
import { pgTable } from "./_table";
import { category_table } from "./categories";

export const recurrenceEnum = pgEnum("recurrence", BUDGET_RECURRENCE);

export const budget_table = pgTable("budget_table", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),

  categoryId: d
    .uuid()
    .references(() => category_table.id, {
      onDelete: "cascade",
    })
    .notNull(),
  userId: d.varchar({ length: 32 }).notNull(),

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

// Solo perché serve la struttura, la query è già nel DB.
// In Drizzle usiamo `.select()` direttamente.
export const budget_instances = pgMaterializedView(
  "badget_budget_instances_mview",
  {
    id: uuid().notNull(),
    originalBudgetId: uuid().notNull(),
    categoryId: uuid().notNull(),
    amount: integer().notNull(),
    instanceFrom: date().$type<Date>().notNull(),
    instanceTo: date().$type<Date>().notNull(),
    userId: varchar({ length: 32 }).notNull(),
  },
).existing();

export type DB_BudgetType = typeof budget_table.$inferSelect;
export type DB_BudgetInsertType = typeof budget_table.$inferInsert;
