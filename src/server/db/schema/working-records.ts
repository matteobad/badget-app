import { sql } from "drizzle-orm";
import { boolean, integer, serial, timestamp } from "drizzle-orm/pg-core";

import { createTable } from "./_table";

// Domain data
export const works = createTable("works", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  employed: boolean("employed").notNull(),
  ral: integer("ral").notNull(),
  fromDate: timestamp("starting_date").notNull(),
  toDate: timestamp("ending_date"),
});
