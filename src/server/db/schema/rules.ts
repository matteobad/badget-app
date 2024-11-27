import { relations } from "drizzle-orm";
import { integer, serial, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { categories } from "./categories";
import { tokens } from "./tokens";

export const rules = pgTable("rules", {
  id: serial().primaryKey(),

  // FK
  userId: varchar({ length: 32 }).notNull(),
  categoryId: integer()
    .notNull()
    .references(() => categories.id),

  ...timestamps,
});

export const rulesRelations = relations(rules, ({ one, many }) => ({
  tokens: many(tokens),
  category: one(categories, {
    fields: [rules.categoryId],
    references: [categories.id],
  }),
}));
