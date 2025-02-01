import { isNotNull, or, relations } from "drizzle-orm";
import {
  check,
  decimal,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { budgetsToCategories } from "./budgets-to-categories";
import { type BudgetPeriod } from "./enum";

export const budgets = pgTable(
  "budgets",
  {
    id: serial().primaryKey(),

    // FK
    userId: varchar({ length: 32 }),
    orgId: varchar({ length: 32 }),

    amount: decimal({ precision: 10, scale: 2 }).default("0"),
    period: text().$type<BudgetPeriod>().notNull(),
    activeFrom: timestamp({ withTimezone: true }).notNull(),
    activeTo: timestamp({ withTimezone: true }).notNull(),

    ...timestamps,
  },
  (t) => [
    check("org_id_or_user_id", or(isNotNull(t.orgId), isNotNull(t.userId))!),
  ],
);

export const budgetsRelations = relations(budgets, ({ many }) => ({
  budgetCategories: many(budgetsToCategories),
}));

export type SelectBudget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;
