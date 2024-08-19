import { relations, sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable } from "./_table";
import {
  type BankAccountType,
  type BudgetPeriod,
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

export const bankConnectionsRelations = relations(
  bankConnections,
  ({ many, one }) => ({
    bankAccount: many(bankAccounts),
    institution: one(institutions, {
      fields: [bankConnections.institutionId],
      references: [institutions.id],
    }),
  }),
);

export const bankAccounts = createTable("bank_accounts", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  bankConnectionId: integer("bank_connection_id"),
  institutionId: varchar("institution_id"),
  userId: varchar("user_id", { length: 128 }).notNull(),

  accountId: varchar("account_id").unique(),
  balance: decimal("balance").default("0"),
  currency: varchar("currency", { length: 4 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  manual: boolean("manual").default(false),
  enabled: boolean("enabled").default(true),
  type: text("type").$type<BankAccountType>(),
});

export const bankAccountsRelations = relations(
  bankAccounts,
  ({ many, one }) => ({
    transactions: many(bankTransactions),
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

export const categories = createTable("categories", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  userId: varchar("user_id", { length: 128 }).notNull(),

  color: varchar("color", { length: 32 }),
  icon: varchar("icon", { length: 32 }),
  name: varchar("name", { length: 64 }).notNull(),
  macro: varchar("macro", { length: 64 }).notNull(),
  type: text("type").$type<CategoryType>().notNull(),
  manual: boolean("manual").default(true),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(bankTransactions),
  budgets: many(categoryBudgets),
}));

export const categoryBudgets = createTable("category_budgets", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  userId: varchar("user_id", { length: 128 }).notNull(),
  categoryId: integer("category_id").notNull(),

  budget: decimal("budget").default("0"),
  period: text("period").$type<BudgetPeriod>().notNull(),
  active_at: timestamp("active_at", { withTimezone: true }).notNull(),
});

export const categoryBudgetsRelations = relations(
  categoryBudgets,
  ({ one }) => ({
    category: one(categories, {
      fields: [categoryBudgets.categoryId],
      references: [categories.id],
    }),
  }),
);
