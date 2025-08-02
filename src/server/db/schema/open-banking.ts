import { sql } from "drizzle-orm";
import { pgEnum, unique } from "drizzle-orm/pg-core";

import {
  BANK_PROVIDER,
  CONNECTION_STATUS,
} from "../../../shared/constants/enum";
import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { organization as organization_table } from "./auth";

export const bankProviderEnum = pgEnum("bank_provider", BANK_PROVIDER);

export const connectionStatusEnum = pgEnum(
  "connection_status",
  CONNECTION_STATUS,
);

export const institution_table = pgTable("institution_table", (d) => ({
  id: d.uuid().defaultRandom().primaryKey().notNull(),

  originalId: d.varchar({ length: 128 }).unique().notNull(),
  name: d.varchar({ length: 256 }).notNull(),
  logo: d.varchar({ length: 2048 }),
  provider: bankProviderEnum().notNull(),
  availableHistory: d.integer(),
  popularity: d.integer().default(0),
  countries: d
    .text()
    .array()
    .default(sql`ARRAY[]::text[]`),

  ...timestamps,
}));

export type DB_InstitutionType = typeof institution_table.$inferSelect;
export type DB_InstitutionInsertType = typeof institution_table.$inferInsert;

export const connection_table = pgTable(
  "connection_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    // FK
    organizationId: d
      .text()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    institutionId: d
      .uuid()
      .notNull()
      .references(() => institution_table.id),

    name: d.text().notNull(),
    logoUrl: d.text(),
    provider: bankProviderEnum().notNull(),
    referenceId: d.varchar().unique(),
    status: connectionStatusEnum().default("connected"),
    errorDetails: d.text(),
    errorRetries: d.smallint().default(sql`'0'`),
    expiresAt: d.timestamp({ withTimezone: true, mode: "string" }),
    lastAccessed: d.timestamp({ withTimezone: true, mode: "string" }),

    ...timestamps,
  }),
  (t) => [
    unique("unique_bank_connections").on(t.institutionId, t.organizationId),
  ],
);

export type DB_ConnectionType = typeof connection_table.$inferSelect;
export type DB_ConnectionInsertType = typeof connection_table.$inferInsert;
