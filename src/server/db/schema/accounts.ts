import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { unique } from "drizzle-orm/pg-core";

import type { AccountType } from "./enum";
import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { connection_table, institution_table } from "./open-banking";

export const account_table = pgTable(
  "account_table",
  (d) => ({
    id: d
      .varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    userId: d.varchar({ length: 32 }).notNull(),
    institutionId: d
      .varchar({ length: 128 })
      .references(() => institution_table.id),
    connectionId: d
      .varchar({ length: 128 })
      .references(() => connection_table.id),

    rawId: d.text().unique(),
    name: d.varchar({ length: 64 }).notNull(),
    description: d.text(),
    type: d.text().$type<AccountType>().default("checking").notNull(),
    logoUrl: d.varchar({ length: 2048 }),
    balance: d.numeric({ precision: 10, scale: 2 }).notNull(),
    currency: d.char({ length: 3 }).notNull(),
    enabled: d.boolean().notNull().default(true),

    ...timestamps,
  }),
  (t) => [unique().on(t.userId, t.rawId)],
);

export const accountsRelations = relations(account_table, ({ one }) => ({
  // transactions: many(transaction_table),
  // workspaceToAccounts: many(workspaceToAccounts),
  institution: one(institution_table, {
    fields: [account_table.institutionId],
    references: [institution_table.id],
  }),
  connection: one(connection_table, {
    fields: [account_table.connectionId],
    references: [connection_table.id],
  }),
}));

export type DB_AccountType = typeof account_table.$inferSelect;
export type DB_AccountInsertType = typeof account_table.$inferInsert;
