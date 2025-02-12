import { relations } from "drizzle-orm";
import { serial, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { category_table } from "./categories";
import { tokens } from "./tokens";

export const rules = pgTable("rules", {
  id: serial().primaryKey(),

  // FK
  userId: varchar({ length: 32 }).notNull(),
  categoryId: varchar({ length: 128 })
    .notNull()
    .references(() => category_table.id),

  ...timestamps,
});

export const rulesRelations = relations(rules, ({ one, many }) => ({
  tokens: many(tokens),
  category: one(category_table, {
    fields: [rules.categoryId],
    references: [category_table.id],
  }),
}));
