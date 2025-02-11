import { createId } from "@paralleldrive/cuid2";
import { isNotNull, or, relations } from "drizzle-orm";
import { boolean, check, text, unique, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { budgetsToCategories } from "./budgets-to-categories";
import { type CategoryType } from "./enum";
import { rules } from "./rules";
import { transactionsToCategories } from "./transactions-to-categories";

export const category_table = pgTable(
  "category_table",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    // FK
    orgId: varchar({ length: 32 }),
    userId: varchar({ length: 32 }),

    name: varchar({ length: 64 }).notNull(),
    slug: varchar({ length: 64 }).notNull(),
    color: varchar({ length: 32 }),
    icon: varchar({ length: 32 }),
    type: text().$type<CategoryType>().notNull(),
    manual: boolean().default(true),

    ...timestamps,
  },
  (t) => [
    check("org_id_or_user_id", or(isNotNull(t.orgId), isNotNull(t.userId))!),
    unique().on(t.userId, t.slug),
  ],
);

export const categoriesRelations = relations(category_table, ({ many }) => ({
  transactions: many(transactionsToCategories),
  budgets: many(budgetsToCategories),
  rules: many(rules),
}));

export type DB_CategoryType = typeof category_table.$inferSelect;
export type DB_CategoryInsertType = typeof category_table.$inferInsert;
