import { relations } from "drizzle-orm";
import {
  char,
  integer,
  numeric,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { accounts } from "./accounts";
import { transactionsToCategories } from "./transactions-to-categories";

export const transaction_table = pgTable("transaction_table", {
  id: serial().primaryKey(),

  accountId: integer()
    .notNull()
    .references(() => accounts.id),

  amount: numeric({ precision: 10, scale: 2 }).notNull(),
  currency: char({ length: 3 }).notNull(),
  date: timestamp({ withTimezone: true }).notNull(),
  description: text().notNull(),

  ...timestamps,
});

export const transactionsRelations = relations(
  transaction_table,
  ({ one, many }) => ({
    account: one(accounts, {
      fields: [transaction_table.accountId],
      references: [accounts.id],
    }),
    transactionCategories: many(transactionsToCategories),
  }),
);

export type SelectTransaction = typeof transaction_table.$inferSelect;
export type InsertTransaction = typeof transaction_table.$inferInsert;
