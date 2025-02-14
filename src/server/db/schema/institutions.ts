import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { integer, text, varchar } from "drizzle-orm/pg-core";

import type { Provider } from "./enum";
import { timestamps } from "../utils";
import { pgTable } from "./_table";

export const institution_table = pgTable("institution_table", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  originalId: varchar({ length: 128 }).notNull(),
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
