import { createId } from "@paralleldrive/cuid2";
import { addDays } from "date-fns";
import { relations, sql } from "drizzle-orm";
import { integer, text, timestamp, varchar } from "drizzle-orm/pg-core";

import type { Provider } from "./enum";
import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { account_table } from "./accounts";
import { ConnectionStatus } from "./enum";

export const institution_table = pgTable("institution_table", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  originalId: varchar({ length: 128 }).unique().notNull(),
  name: varchar({ length: 256 }).notNull(),
  logo: varchar({ length: 2048 }),
  provider: text().$type<Provider>().notNull(),
  availableHistory: integer(),
  popularity: integer().default(0),
  countries: text()
    .array()
    .default(sql`ARRAY[]::text[]`),

  ...timestamps,
});

// export const institutionsRelations = relations(
//   institution_table,
//   ({ many }) => ({
//     accounts: many(account_table),
//     connections: many(connections),
//   }),
// );

export type DB_InstitutionType = typeof institution_table.$inferSelect;
export type DB_InstitutionInsertType = typeof institution_table.$inferInsert;

export const connection_table = pgTable("connection_table", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  // FK
  userId: varchar({ length: 32 }).notNull(),
  institutionId: varchar({ length: 128 })
    .notNull()
    .references(() => institution_table.id),

  referenceId: varchar().unique(),
  provider: text().$type<Provider>().notNull(),
  status: text().$type<ConnectionStatus>().default(ConnectionStatus.UNKNOWN),
  validUntil: timestamp({ withTimezone: true }).$defaultFn(() =>
    addDays(new Date(), 90),
  ),

  ...timestamps,
});

export const connection_relations = relations(
  connection_table,
  ({ many, one }) => ({
    accounts: many(account_table),
    institution: one(institution_table, {
      fields: [connection_table.institutionId],
      references: [institution_table.id],
    }),
  }),
);

export type DB_ConnectionType = typeof connection_table.$inferSelect;
export type DB_ConnectionInsertType = typeof connection_table.$inferInsert;
