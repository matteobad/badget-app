import { sql } from "drizzle-orm";
import { integer, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { createTable } from "./_table";

export const ContractType = {
  PERMANENT: "PERMANENT",
  CONTRACT: "CONTRACT",
  OTHER: "OTHER",
  UNEMPLOYED: "UNEMPLOYED",
} as const;
export type ContractType = (typeof ContractType)[keyof typeof ContractType];

// Domain data
export const works = createTable("works", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  userId: varchar("user_id", { length: 512 }).notNull(),

  company: varchar("company", { length: 128 }),
  contract: text("contract").$type<ContractType>(),
  ral: integer("ral").notNull(),
  fromDate: timestamp("starting_date").notNull(),
  toDate: timestamp("ending_date"),
});
