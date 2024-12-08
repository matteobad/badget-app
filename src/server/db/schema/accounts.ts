import { relations } from "drizzle-orm";
import { char, integer, numeric, serial, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { connections } from "./connections";
import { institutions } from "./institutions";
import { transactions } from "./transactions";
import { workspaceToAccounts } from "./workspace-to-accounts";

export const accounts = pgTable("accounts", {
  id: serial().primaryKey().notNull(),

  userId: varchar({ length: 32 }).notNull(),
  institutionId: varchar()
    .notNull()
    .references(() => institutions.id),
  connectionId: integer()
    .notNull()
    .references(() => connections.id),

  name: varchar({ length: 64 }).notNull(),
  balance: numeric({ precision: 10, scale: 2 }).notNull(),
  currency: char({ length: 3 }).notNull(),

  ...timestamps,
});

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  transactions: many(transactions),
  workspaceToAccounts: many(workspaceToAccounts),
  institution: one(institutions, {
    fields: [accounts.institutionId],
    references: [institutions.id],
  }),
  connection: one(connections, {
    fields: [accounts.connectionId],
    references: [connections.id],
  }),
}));

export type SelectAccount = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
