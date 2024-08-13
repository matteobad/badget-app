import { relations, sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  numeric,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable } from "./_table";

export const Provider = {
  GOCARDLESS: "GOCARDLESS",
  PLAID: "PLAID",
  TELLER: "TELLER",
} as const;
export type Provider = (typeof Provider)[keyof typeof Provider];

export const institutions = createTable("instituions", {
  id: varchar("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  name: varchar("name", { length: 256 }).notNull(),
  logo: varchar("logo", { length: 2048 }),
  provider: text("provider").$type<Provider>().notNull(),
  availableHistory: integer("available_history"),
  popularity: integer("popularity").default(0),
});

export const institutionsRelations = relations(institutions, ({ many }) => ({
  accounts: many(bankAccounts),
}));

export const bankAccounts = createTable("bank_accounts", {
  id: varchar("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  connectionId: integer("connection_id"),
  institutionId: varchar("institution_id"),
  userId: varchar("user_id", { length: 128 }).notNull(),

  name: varchar("name", { length: 256 }).notNull(),
  manual: boolean("manual").default(false),
  enabled: boolean("enabled").default(true),
  currency: varchar("currency", { length: 4 }).notNull(),
  balance: real("balance"),
  type: varchar("type", { length: 256 }).notNull(),
});

export const ConnectionStatus = {
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  UNKNOWN: "UNKNOWN",
} as const;
export type ConnectionStatus =
  (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

export const bankConnections = createTable("bank_connections", {
  id: varchar("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  institutionId: integer("institution_id"),
  userId: varchar("user_id", { length: 128 }).notNull(),

  name: varchar("name", { length: 128 }).notNull(),
  logoUrl: varchar("logo_url", { length: 2048 }),
  provider: text("provider").$type<Provider>().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  enrollmentId: varchar("enrollment_id", { length: 256 }),
  lastAccessed: timestamp("last_accessed", { withTimezone: true }),
  error: varchar("error", { length: 128 }),
  status: text("status").$type<Provider>().notNull(),
});

export const bankAccountsRelations = relations(
  bankAccounts,
  ({ many, one }) => ({
    transactions: many(transactions),
    institution: one(institutions, {
      fields: [bankAccounts.institutionId],
      references: [institutions.id],
    }),
    connection: one(bankConnections, {
      fields: [bankAccounts.connectionId],
      references: [bankConnections.id],
    }),
  }),
);

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
  account: one(bankAccounts, {
    fields: [transactions.accountId],
    references: [bankAccounts.id],
  }),
  category: one(categories, {
    fields: [transactions.accountId],
    references: [categories.id],
  }),
}));
