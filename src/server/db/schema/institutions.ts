import { relations, sql } from "drizzle-orm";
import { integer, text, varchar } from "drizzle-orm/pg-core";

import type { Provider } from "./enum";
import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { accounts } from "./accounts";
import { connections } from "./connections";

export const institutions = pgTable("instituions", {
  id: varchar().primaryKey(),

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

export const institutionsRelations = relations(institutions, ({ many }) => ({
  accounts: many(accounts),
  connections: many(connections),
}));

export type SelectInstitution = typeof institutions.$inferSelect;
export type InsertInstitution = typeof institutions.$inferInsert;
