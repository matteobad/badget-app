import { isNotNull, or, relations } from "drizzle-orm";
import {
  boolean,
  check,
  serial,
  text,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { budgetsToCategories } from "./budgets-to-categories";
import { type CategoryType } from "./enum";
import { rules } from "./rules";
import { transactionsToCategories } from "./transactions-to-categories";

export const categories = pgTable(
  "categories",
  {
    id: serial().primaryKey(),

    // FK
    orgId: varchar({ length: 32 }),
    userId: varchar({ length: 32 }),

    color: varchar({ length: 32 }),
    icon: varchar({ length: 32 }),
    name: varchar({ length: 64 }).notNull(),
    macro: varchar({ length: 64 }).notNull(),
    type: text().$type<CategoryType>().notNull(),
    manual: boolean().default(true),

    ...timestamps,
  },
  (t) => [
    check("org_id_or_user_id", or(isNotNull(t.orgId), isNotNull(t.userId))!),
    unique().on(t.userId, t.name),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactionsToCategories),
  budgets: many(budgetsToCategories),
  rules: many(rules),
}));

export type SelectCategory = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
