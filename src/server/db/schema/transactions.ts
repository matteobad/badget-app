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

export const transactions = pgTable("transactions", {
  id: serial().primaryKey(),

  accountId: integer()
    .notNull()
    .references(() => accounts.id),

  amount: numeric({ precision: 10, scale: 2 }).notNull(),
  currency: char({ length: 3 }).notNull(),
  date: timestamp({ withTimezone: true }).notNull(),
  description: text(),

  ...timestamps,
});

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    account: one(accounts, {
      fields: [transactions.accountId],
      references: [accounts.id],
    }),
    transactionCategories: many(transactionsToCategories),
  }),
);

export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
