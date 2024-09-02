import { relations, sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable } from "./_table";
import { type BudgetPeriod, type CategoryType } from "./enum";
import { bankTransactions } from "./open-banking";

export const category = createTable(
  "category",
  {
    id: serial("id").primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),

    // FK
    userId: varchar("user_id", { length: 128 }).notNull(),

    color: varchar("color", { length: 32 }),
    icon: varchar("icon", { length: 32 }),
    name: varchar("name", { length: 64 }).notNull(),
    macro: varchar("macro", { length: 64 }).notNull(),
    type: text("type").$type<CategoryType>().notNull(),
    manual: boolean("manual").default(true),
  },
  (t) => ({
    userId_name_unq: unique().on(t.userId, t.name),
  }),
);

export const categoriesRelations = relations(category, ({ many }) => ({
  transactions: many(bankTransactions),
  budgets: many(categoryBudgets),
  rules: many(categoryRules),
}));

export const categoryBudgets = createTable("category_budgets", {
  id: serial("id").primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),

  // FK
  userId: varchar("user_id", { length: 128 }).notNull(),
  categoryId: integer("category_id").notNull(),

  budget: decimal("budget").default("0").notNull(),
  period: text("period").$type<BudgetPeriod>().notNull(),
  activeFrom: timestamp("active_from", { withTimezone: true }).notNull(),
});

export const categoryBudgetsRelations = relations(
  categoryBudgets,
  ({ one }) => ({
    category: one(category, {
      fields: [categoryBudgets.categoryId],
      references: [category.id],
    }),
  }),
);

export const categoryRules = createTable("category_rules", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),

  // FK
  userId: varchar("user_id", { length: 128 }).notNull(),
  categoryId: integer("category_id").notNull(),
});

export const categoryRulesRelations = relations(categoryRules, ({ many }) => ({
  tokens: many(categoryRulesTokens),
}));

export const categoryRulesTokens = createTable(
  "category_rules_token",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),

    // FK
    categoryRuleId: integer("category_rule_id").notNull(),

    token: text("token").notNull(),
    relevance: integer("relevance").default(1).notNull(),
  },
  (table) => {
    return {
      uniqueRuleToken: uniqueIndex("categoryRuleId_token_unq").on(
        table.categoryRuleId,
        table.token,
      ),
    };
  },
);

export const categoryRulesTokensRelations = relations(
  categoryRulesTokens,
  ({ one }) => ({
    rule: one(categoryRules, {
      fields: [categoryRulesTokens.categoryRuleId],
      references: [categoryRules.id],
    }),
  }),
);
