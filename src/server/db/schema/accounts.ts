import { relations } from "drizzle-orm";
import { char, numeric, serial, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { institutions } from "./institutions";
import { transactions } from "./transactions";

export const accounts = pgTable("accounts", {
  id: serial().primaryKey().notNull(),

  userId: varchar({ length: 32 }).notNull(),
  institutionId: varchar()
    .notNull()
    .references(() => institutions.id),

  name: varchar({ length: 64 }).notNull(),
  balance: numeric({ precision: 10, scale: 2 }).notNull(),
  currency: char({ length: 3 }).notNull(),

  ...timestamps,
});

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  transactions: many(transactions),
  institution: one(institutions, {
    fields: [accounts.institutionId],
    references: [institutions.id],
  }),
}));

export type SelectAccount = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
