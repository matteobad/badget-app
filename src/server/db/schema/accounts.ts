import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { char, integer, numeric, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { connections } from "./connections";
import { institution_table } from "./institutions";
import { transaction_table } from "./transactions";
import { workspaceToAccounts } from "./workspace-to-accounts";

export const account_table = pgTable("account_table", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  userId: varchar({ length: 32 }).notNull(),
  institutionId: varchar().references(() => institution_table.id),
  connectionId: integer().references(() => connections.id),

  name: varchar({ length: 64 }).notNull(),
  balance: numeric({ precision: 10, scale: 2 }).notNull(),
  currency: char({ length: 3 }).notNull(),

  ...timestamps,
});

export const accountsRelations = relations(account_table, ({ one, many }) => ({
  transactions: many(transaction_table),
  workspaceToAccounts: many(workspaceToAccounts),
  institution: one(institution_table, {
    fields: [account_table.institutionId],
    references: [institution_table.id],
  }),
  connection: one(connections, {
    fields: [account_table.connectionId],
    references: [connections.id],
  }),
}));

export type DB_AccountType = typeof account_table.$inferSelect;
export type DB_AccountInsertType = typeof account_table.$inferInsert;
