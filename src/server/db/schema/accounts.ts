import { pgEnum, unique } from "drizzle-orm/pg-core";

import { numericCasted, timestamps } from "../utils";
import { pgTable } from "./_table";
import { user as user_table } from "./auth";
import { ACCOUNT_TYPE } from "./enum";
import { connection_table, institution_table } from "./open-banking";

export const accountTypeEnum = pgEnum("account_type", ACCOUNT_TYPE);

export const account_table = pgTable(
  "account_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    userId: d
      .text()
      .notNull()
      .references(() => user_table.id, { onDelete: "cascade" }),
    institutionId: d.uuid().references(() => institution_table.id),
    connectionId: d.uuid().references(() => connection_table.id),

    rawId: d.text().unique(),
    name: d.varchar({ length: 64 }).notNull(),
    description: d.text(),
    type: accountTypeEnum().notNull(),
    logoUrl: d.varchar({ length: 2048 }),
    balance: numericCasted({ precision: 10, scale: 2 }).notNull(),
    currency: d.char({ length: 3 }).notNull(),
    enabled: d.boolean().notNull().default(true),
    manual: d.boolean().notNull().default(false),
    errorDetails: d.text(),
    errorRetries: d.smallint(),

    ...timestamps,
  }),
  (t) => [unique().on(t.userId, t.rawId)],
);

// export const accountsRelations = relations(account_table, ({ one, many }) => ({
//   transactions: many(transaction_table),
//   institution: one(institution_table, {
//     fields: [account_table.institutionId],
//     references: [institution_table.id],
//   }),
//   connection: one(connection_table, {
//     fields: [account_table.connectionId],
//     references: [connection_table.id],
//   }),
// }));

export type DB_AccountType = typeof account_table.$inferSelect;
export type DB_AccountInsertType = typeof account_table.$inferInsert;
