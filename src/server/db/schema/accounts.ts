import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  char,
  numeric,
  text,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { type AccountType } from "./enum";
import { connection_table, institution_table } from "./open-banking";

export const account_table = pgTable(
  "account_table",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    userId: varchar({ length: 32 }).notNull(),
    institutionId: varchar({ length: 128 }).references(
      () => institution_table.id,
    ),
    connectionId: varchar({ length: 128 }).references(
      () => connection_table.id,
    ),

    rawId: text().unique(),
    name: varchar({ length: 64 }).notNull(),
    description: text(),
    type: text().$type<AccountType>().default("checking").notNull(),
    logoUrl: varchar({ length: 2048 }),
    balance: numeric({ precision: 10, scale: 2 }).notNull(),
    currency: char({ length: 3 }).notNull(),
    enabled: boolean().notNull().default(true),

    ...timestamps,
  },
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
