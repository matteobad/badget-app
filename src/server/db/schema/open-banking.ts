import { relations, sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  real,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable } from "./_table";
import {
  type BankAccountType,
  type CategoryType,
  type ConnectionStatus,
  type Provider,
} from "./enum";

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
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  bankAccountBalanceId: integer("bank_account_balance_id"),
  bankConnectionId: integer("bank_connection_id"),
  institutionId: varchar("institution_id"),
  userId: varchar("user_id", { length: 128 }).notNull(),

  accountId: varchar("account_id").unique(),
  name: varchar("name", { length: 256 }).notNull(),
  manual: boolean("manual").default(false),
  enabled: boolean("enabled").default(true),
  type: text("type").$type<BankAccountType>(),
});

export const bankAccountsRelations = relations(
  bankAccounts,
  ({ many, one }) => ({
    transactions: many(bankTransactions),
    balance: one(bankAccountBalances, {
      fields: [bankAccounts.bankAccountBalanceId],
      references: [bankAccountBalances.id],
    }),
    institution: one(institutions, {
      fields: [bankAccounts.institutionId],
      references: [institutions.id],
    }),
    connection: one(bankConnections, {
      fields: [bankAccounts.bankConnectionId],
      references: [bankConnections.id],
    }),
  }),
);

export const bankAccountBalances = createTable("bank_account_balances", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  bankAccountId: integer("bank_account_id").unique(),

  amount: real("amount"),
  currency: varchar("currency", { length: 4 }),
});

export const bankAccountBalancesRelations = relations(
  bankAccountBalances,
  ({ one }) => ({
    account: one(bankAccounts, {
      fields: [bankAccountBalances.bankAccountId],
      references: [bankAccounts.id],
    }),
  }),
);

export const bankConnections = createTable(
  "bank_connections",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),

    // FK
    institutionId: varchar("institution_id"),
    userId: varchar("user_id", { length: 128 }).notNull(),

    referenceId: varchar("reference_id"),
    name: varchar("name", { length: 128 }).notNull(),
    logoUrl: varchar("logo_url", { length: 2048 }),
    provider: text("provider").$type<Provider>().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastAccessed: timestamp("last_accessed", { withTimezone: true }),
    error: varchar("error", { length: 128 }),
    status: text("status").$type<ConnectionStatus>().notNull(),
  },
  (t) => ({
    user_institution_unq: unique().on(t.institutionId, t.userId),
  }),
);

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
  transactions: many(bankTransactions),
}));

export const bankTransactions = createTable("bank_transactions", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  accountId: varchar("account_id"),
  categoryId: integer("category_id"),
  userId: varchar("user_id", { length: 128 }).notNull(),

  transactionId: varchar("transaction_id").unique(),
  amount: decimal("amount"),
  currency: varchar("currency", { length: 64 }),
  date: timestamp("date", { withTimezone: true }),
  name: varchar("name", { length: 256 }),
  description: varchar("description", { length: 256 }),
  category: varchar("category", { length: 64 }),
  method: varchar("method", { length: 64 }),
  currencyRate: decimal("currency_rate"),
  currencySource: varchar("currency_source", { length: 64 }),
  balance: decimal("balance"),
  status: varchar("status", { length: 64 }),
});

export const bankTransactionsRelations = relations(
  bankTransactions,
  ({ one }) => ({
    account: one(bankAccounts, {
      fields: [bankTransactions.accountId],
      references: [bankAccounts.accountId],
    }),
    category: one(categories, {
      fields: [bankTransactions.accountId],
      references: [categories.id],
    }),
  }),
);
