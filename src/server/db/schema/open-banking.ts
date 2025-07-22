import { sql } from "drizzle-orm";
import { pgEnum, unique } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { user as user_table } from "./auth";
import { BANK_PROVIDER, CONNECTION_STATUS } from "./enum";

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
    userId: d
      .text()
      .notNull()
      .references(() => user_table.id, { onDelete: "cascade" }),
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

    ...timestamps,
  }),
  (t) => [unique("unique_bank_connections").on(t.institutionId, t.userId)],
);

// export const connection_relations = relations(
//   connection_table,
//   ({ many, one }) => ({
//     accounts: many(account_table),
//     institution: one(institution_table, {
//       fields: [connection_table.institutionId],
//       references: [institution_table.id],
//     }),
//   }),
// );

export type DB_ConnectionType = typeof connection_table.$inferSelect;
export type DB_ConnectionInsertType = typeof connection_table.$inferInsert;
