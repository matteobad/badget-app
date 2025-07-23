import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { index, unique, uniqueIndex } from "drizzle-orm/pg-core";

import { type CategoryType } from "../../../shared/constants/enum";
import { timestamps } from "../utils";
import { pgTable } from "./_table";

export const category_table = pgTable(
  "category_table",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),

    // FK
    userId: d.varchar({ length: 32 }),
    parentId: d.uuid().references((): AnyPgColumn => category_table.id, {
      onDelete: "set null",
    }),

    type: d.text().$type<CategoryType>().notNull(),
    name: d.varchar({ length: 64 }).notNull(),
    slug: d.varchar({ length: 64 }).notNull(),
    color: d.varchar({ length: 32 }),
    icon: d.varchar({ length: 32 }),
    description: d.text(),

    ...timestamps,
  }),
  (t) => [unique("unique_user_slug").on(t.slug, t.userId)],
);

export type DB_CategoryType = typeof category_table.$inferSelect;
export type DB_CategoryInsertType = typeof category_table.$inferInsert;

export const rule_table = pgTable(
  "rule_table",
  (d) => ({
    id: d
      .varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    // FK
    userId: d.varchar({ length: 32 }).notNull(),
    categoryId: d
      .uuid()
      .notNull()
      .references(() => category_table.id),

    ...timestamps,
  }),
  (t) => [index().on(t.userId)],
);

export type DB_RuleType = typeof rule_table.$inferSelect;
export type DB_RuleInsertType = typeof rule_table.$inferInsert;

export const token_table = pgTable(
  "token_table",
  (d) => ({
    id: d
      .varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    // FK
    ruleId: d
      .varchar({ length: 128 })
      .notNull()
      .references(() => rule_table.id),

    token: d.text().notNull(),
    relevance: d.integer().default(1).notNull(),

    ...timestamps,
  }),
  (t) => [uniqueIndex().on(t.ruleId, t.token)],
);

export type DB_TokenType = typeof token_table.$inferSelect;
export type DB_TokenInsertType = typeof token_table.$inferInsert;
