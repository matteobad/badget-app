import { index, pgEnum, unique } from "drizzle-orm/pg-core";

import { ACCOUNT_TYPE, BALANCE_SOURCE } from "../../../shared/constants/enum";
import { numericCasted, timestamps } from "../utils";
import { pgTable } from "./_table";
import { organization as organization_table } from "./auth";
import { connection_table, institution_table } from "./open-banking";

export const accountTypeEnum = pgEnum("account_type", ACCOUNT_TYPE);

export const balanceSourceEnum = pgEnum("balance_source", BALANCE_SOURCE);

export const account_table = pgTable(
  "account_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    institutionId: d.uuid().references(() => institution_table.id),
    connectionId: d.uuid().references(() => connection_table.id),

    name: d.varchar({ length: 64 }).notNull(),
    description: d.text(),
    type: accountTypeEnum().notNull(),
    logoUrl: d.varchar({ length: 2048 }),
    balance: numericCasted({ precision: 10, scale: 2 }).notNull(),
    currency: d.char({ length: 3 }).notNull(),
    enabled: d.boolean().notNull().default(true),
    manual: d.boolean().notNull().default(false),

    // Metadata for internal use
    externalId: d.text(), // External ID from API
    accountReference: d.text(), // Gocardless ref of the connection
    timezone: d.text().notNull().default("UTC"), // Account timezone for end-of-day calculations
    t0Datetime: d.timestamp({ withTimezone: true, mode: "string" }), // Start-of-day for manual accounts
    openingBalance: numericCasted({ precision: 10, scale: 2 }), // Opening balance for manual accounts
    authoritativeFrom: d.timestamp({ withTimezone: true, mode: "string" }), // First API snapshot date for connected accounts
    errorDetails: d.text(),
    errorRetries: d.smallint(),

    ...timestamps,
  }),
  (t) => [unique().on(t.organizationId, t.externalId)],
);

export type DB_AccountType = typeof account_table.$inferSelect;
export type DB_AccountInsertType = typeof account_table.$inferInsert;

export const balance_snapshot_table = pgTable(
  "balance_snapshot_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    accountId: d
      .uuid()
      .references(() => account_table.id, { onDelete: "cascade" })
      .notNull(),

    date: d.date({ mode: "string" }).notNull(),
    closingBalance: numericCasted({ precision: 10, scale: 2 }).notNull(),
    currency: d.char({ length: 3 }).notNull(),
    source: balanceSourceEnum().notNull().default("derived"), // Track if balance comes from API or is computed

    ...timestamps,
  }),
  (t) => [
    unique().on(t.accountId, t.date),
    index("organization_account_date_idx").on(
      t.organizationId,
      t.accountId,
      t.date.desc(),
    ),
  ],
);

export type DB_BalanceSnapshotType = typeof balance_snapshot_table.$inferSelect;
export type DB_BalanceSnapshotInsertType =
  typeof balance_snapshot_table.$inferInsert;

// Table for balance offsets (for manual accounts)
export const balance_offset_table = pgTable(
  "balance_offset_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    accountId: d
      .uuid()
      .references(() => account_table.id, { onDelete: "cascade" })
      .notNull(),

    effectiveDatetime: d
      .timestamp({ withTimezone: true, mode: "string" })
      .notNull(),
    amount: numericCasted({ precision: 10, scale: 2 }).notNull(),

    ...timestamps,
  }),
  (t) => [
    index("balance_offset_account_datetime_idx").on(
      t.accountId,
      t.effectiveDatetime.desc(),
    ),
  ],
);

export type DB_BalanceOffsetType = typeof balance_offset_table.$inferSelect;
export type DB_BalanceOffsetInsertType =
  typeof balance_offset_table.$inferInsert;

// Table for import tracking
export const import_table = pgTable(
  "import_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    accountId: d
      .uuid()
      .references(() => account_table.id, { onDelete: "cascade" })
      .notNull(),

    fileName: d.text().notNull(),
    rowsOk: d.integer().notNull().default(0),
    rowsDup: d.integer().notNull().default(0),
    rowsRej: d.integer().notNull().default(0),
    dateMin: d.date({ mode: "string" }),
    dateMax: d.date({ mode: "string" }),

    ...timestamps,
  }),
  (t) => [
    index("import_account_created_idx").on(t.accountId, t.createdAt.desc()),
  ],
);

export type DB_ImportType = typeof import_table.$inferSelect;
export type DB_ImportInsertType = typeof import_table.$inferInsert;
