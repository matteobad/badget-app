import { sql } from "drizzle-orm";
import { integer, pgEnum, text, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { BANK_PROVIDER, CONNECTION_STATUS } from "./enum";

export const bankProviderEnum = pgEnum("bank_provider", BANK_PROVIDER);

export const connectionStatusEnum = pgEnum(
  "connection_status",
  CONNECTION_STATUS,
);

export const institution_table = pgTable("institution_table", (d) => ({
  id: d.uuid().defaultRandom().primaryKey().notNull(),

  originalId: varchar({ length: 128 }).unique().notNull(),
  name: varchar({ length: 256 }).notNull(),
  logo: varchar({ length: 2048 }),
  provider: bankProviderEnum().notNull(),
  availableHistory: integer(),
  popularity: integer().default(0),
  countries: text()
    .array()
    .default(sql`ARRAY[]::text[]`),

  ...timestamps,
}));

export type DB_InstitutionType = typeof institution_table.$inferSelect;
export type DB_InstitutionInsertType = typeof institution_table.$inferInsert;

export const connection_table = pgTable("connection_table", (d) => ({
  id: d.uuid().defaultRandom().primaryKey().notNull(),

  // FK
  userId: d.varchar({ length: 32 }).notNull(),
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
}));

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
