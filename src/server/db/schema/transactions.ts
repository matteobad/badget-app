import { relations } from "drizzle-orm";
import {
  char,
  numeric,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { account_table } from "./accounts";
import { transactionsToCategories } from "./transactions-to-categories";

export const transaction_table = pgTable("transaction_table", {
  id: serial().primaryKey(),

  accountId: varchar({ length: 128 })
    .notNull()
    .references(() => account_table.id),

  amount: numeric({ precision: 10, scale: 2 }).notNull(),
  currency: char({ length: 3 }).notNull(),
  date: timestamp({ withTimezone: true }).notNull(),
  description: text().notNull(),

  ...timestamps,
});

export const transactionsRelations = relations(
  transaction_table,
  ({ one, many }) => ({
    account: one(account_table, {
      fields: [transaction_table.accountId],
      references: [account_table.id],
    }),
    transactionCategories: many(transactionsToCategories),
  }),
);

export type SelectTransaction = typeof transaction_table.$inferSelect;
export type InsertTransaction = typeof transaction_table.$inferInsert;
