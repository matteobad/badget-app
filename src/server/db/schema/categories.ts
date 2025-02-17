import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { boolean, unique, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";

export const category_table = pgTable(
  "category_table",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    // FK
    userId: varchar({ length: 32 }),

    name: varchar({ length: 64 }).notNull(),
    slug: varchar({ length: 64 }).notNull(),
    color: varchar({ length: 32 }),
    icon: varchar({ length: 32 }),
    parentId: varchar({ length: 128 }).references(
      (): AnyPgColumn => category_table.id,
      { onDelete: "set null" },
    ),
    manual: boolean().default(true),

    ...timestamps,
  },
  (t) => [unique().on(t.userId, t.slug)],
);

export type DB_CategoryType = typeof category_table.$inferSelect;
export type DB_CategoryInsertType = typeof category_table.$inferInsert;
