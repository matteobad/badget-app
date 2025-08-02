import { pgEnum, unique } from "drizzle-orm/pg-core";

import { ACCOUNT_TYPE } from "../../../shared/constants/enum";
import { numericCasted, timestamps } from "../utils";
import { pgTable } from "./_table";
import { organization as organization_table } from "./auth";
import { connection_table, institution_table } from "./open-banking";

export const accountTypeEnum = pgEnum("account_type", ACCOUNT_TYPE);

export const account_table = pgTable(
  "account_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .text()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
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
    accountReference: d.text(),

    ...timestamps,
  }),
  (t) => [unique().on(t.organizationId, t.rawId)],
);

export type DB_AccountType = typeof account_table.$inferSelect;
export type DB_AccountInsertType = typeof account_table.$inferInsert;

export const account_balance_table = pgTable(
  "account_balance_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .text()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    accountId: d.uuid().references(() => account_table.id),

    date: d.date({ mode: "string" }).notNull(),
    balance: numericCasted({ precision: 10, scale: 2 }).notNull(),
    currency: d.char({ length: 3 }).notNull(),

    ...timestamps,
  }),
  (t) => [unique().on(t.accountId, t.date)],
);

export type DB_AccountBalanceType = typeof account_balance_table.$inferSelect;
export type DB_AccountBalanceInsertType =
  typeof account_balance_table.$inferInsert;
