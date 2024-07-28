import { relations, sql } from "drizzle-orm";
import {
  decimal,
  integer,
  numeric,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable } from "./_table";

export const institutions = createTable("instituions", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  name: varchar("name", { length: 256 }),
  bic: varchar("bic", { length: 256 }),
});

export const institutionsRelations = relations(institutions, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable("accounts", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  institutionId: integer("institution_id"),
  userId: varchar("user_id", { length: 128 }).notNull(),

  name: varchar("name", { length: 256 }).notNull(),
  accountId: varchar("account_id", { length: 64 }),
  expires: timestamp("expires", { mode: "date" }),
});

export const accountsRelations = relations(accounts, ({ many, one }) => ({
  balances: many(balances),
  transactions: many(transactions),
  institution: one(institutions, {
    fields: [accounts.institutionId],
    references: [institutions.id],
  }),
}));

export const balances = createTable("balances", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  accountId: integer("account_id"),
  institutionId: integer("institution_id"),

  amount: numeric("amount", { precision: 2 }),
  currency: varchar("currency", { length: 64 }),
});

export const balancesRelations = relations(balances, ({ one }) => ({
  account: one(accounts, {
    fields: [balances.accountId],
    references: [accounts.id],
  }),
}));

export const CategoryType = {
  INCOME: "INCOME",
  FIXED_COSTS: "FIXED_COSTS",
  SAVING_AND_INVESTMENTS: "SAVING_AND_INVESTMENTS",
  CATEGORY_BUDGETS: "CATEGORY_BUDGETS",
  TRANSFERS: "TRANSFERS",
} as const;
export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

export const categories = createTable("categories", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  name: varchar("name", { length: 64 }),
  type: text("type").$type<CategoryType>().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactions = createTable("transactions", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  accountId: integer("account_id"),
  categoryId: integer("category_id"),

  amount: decimal("amount", { precision: 2 }),
  currency: varchar("currency", { length: 64 }),
  date: timestamp("date", { withTimezone: true }),
  description: varchar("description", { length: 256 }),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.accountId],
    references: [categories.id],
  }),
}));
