import { relations } from "drizzle-orm";
import { integer, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { rules } from "./rules";

export const tokens = pgTable(
  "tokens",
  {
    id: serial().primaryKey(),

    // FK
    ruleId: integer()
      .notNull()
      .references(() => rules.id),

    token: text().notNull(),
    relevance: integer().default(1).notNull(),

    ...timestamps,
  },
  (table) => [uniqueIndex().on(table.ruleId, table.token)],
);

export const tokensRelations = relations(tokens, ({ one }) => ({
  rule: one(rules, {
    fields: [tokens.ruleId],
    references: [rules.id],
  }),
}));
