import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  text,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { type CategoryType } from "./enum";

export const category_table = pgTable(
  "category_table",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    // FK
    userId: varchar({ length: 32 }),
    parentId: varchar({ length: 128 }).references(
      (): AnyPgColumn => category_table.id,
      { onDelete: "set null" },
    ),

    type: text().$type<CategoryType>().notNull(),
    name: varchar({ length: 64 }).notNull(),
    slug: varchar({ length: 64 }).notNull(),
    color: varchar({ length: 32 }),
    icon: varchar({ length: 32 }),
    description: text(),

    ...timestamps,
  },
  (t) => [unique().on(t.slug, t.userId)],
);

export type DB_CategoryType = typeof category_table.$inferSelect;
export type DB_CategoryInsertType = typeof category_table.$inferInsert;

export const rule_table = pgTable(
  "rule_table",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    // FK
    userId: varchar({ length: 32 }).notNull(),
    categoryId: varchar({ length: 128 })
      .notNull()
      .references(() => category_table.id),

    ...timestamps,
  },
  (t) => [index().on(t.userId)],
);

export type DB_RuleType = typeof rule_table.$inferSelect;
export type DB_RuleInsertType = typeof rule_table.$inferInsert;

export const token_table = pgTable(
  "token_table",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    // FK
    ruleId: varchar({ length: 128 })
      .notNull()
      .references(() => rule_table.id),

    token: text().notNull(),
    relevance: integer().default(1).notNull(),

    ...timestamps,
  },
  (t) => [uniqueIndex().on(t.ruleId, t.token)],
);

export type DB_TokenType = typeof token_table.$inferSelect;
export type DB_TokenInsertType = typeof token_table.$inferInsert;
