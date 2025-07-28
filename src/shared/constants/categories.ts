import { randomUUID } from "node:crypto";
import type { DB_CategoryInsertType } from "~/server/db/schema/categories";

import type { CategoryType } from "./enum";

const CATEGORY_UUIDS: Record<CategoryType, string> = {
  income: randomUUID(),
  expense: randomUUID(),
  savings: randomUUID(),
  investments: randomUUID(),
  transfer: randomUUID(),
};

export const DEFAULT_CATEGORIES: DB_CategoryInsertType[] = [
  {
    id: CATEGORY_UUIDS.income,
    slug: "income",
    name: "Income",
    type: "income",
    color: "#fafafa",
    icon: "banknote-arrow-up",
    description: "Money received from salary, business, or other sources.",
  },
  {
    id: CATEGORY_UUIDS.expense,
    slug: "expense",
    name: "Expense",
    type: "expense",
    color: "#fafafa",
    icon: "banknote-arrow-down",
    description: "Money spent on goods, services, or bills.",
  },
  {
    id: CATEGORY_UUIDS.savings,
    slug: "savings",
    name: "Savings",
    type: "savings",
    color: "#fafafa",
    icon: "piggy-bank",
    description: "Funds set aside for future use or emergencies.",
  },
  {
    id: CATEGORY_UUIDS.investments,
    slug: "investments",
    name: "Investments",
    type: "investments",
    color: "#fafafa",
    icon: "chart-candlestick",
    description: "Money allocated to stocks, bonds, or other assets.",
  },
  {
    id: CATEGORY_UUIDS.transfer,
    slug: "transfer",
    name: "Transfer",
    type: "transfer",
    color: "#fafafa",
    icon: "arrow-left-right",
    description: "Movement of money between accounts.",
  },

  // Subcategories for Income
  {
    slug: "salary",
    name: "Salary",
    type: "income",
    color: "#e0f7fa",
    icon: "badge-dollar-sign",
    description: "Income from employment or regular job.",
    parentId: CATEGORY_UUIDS.income,
  },
  {
    slug: "business",
    name: "Business",
    type: "income",
    color: "#e8f5e9",
    icon: "briefcase",
    description: "Income from business or freelance work.",
    parentId: CATEGORY_UUIDS.income,
  },
  {
    slug: "interest",
    name: "Interest",
    type: "income",
    color: "#fffde7",
    icon: "percent",
    description: "Interest earned from savings or investments.",
    parentId: CATEGORY_UUIDS.income,
  },

  // Subcategories for Expense
  {
    slug: "groceries",
    name: "Groceries",
    type: "expense",
    color: "#ffe0b2",
    icon: "shopping-cart",
    description: "Money spent on food and groceries.",
    parentId: CATEGORY_UUIDS.expense,
  },
  {
    slug: "utilities",
    name: "Utilities",
    type: "expense",
    color: "#e1bee7",
    icon: "plug",
    description: "Bills for electricity, water, gas, etc.",
    parentId: CATEGORY_UUIDS.expense,
  },
  {
    slug: "transportation",
    name: "Transportation",
    type: "expense",
    color: "#bbdefb",
    icon: "car",
    description: "Expenses for commuting and travel.",
    parentId: CATEGORY_UUIDS.expense,
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    type: "expense",
    color: "#f8bbd0",
    icon: "film",
    description: "Spending on movies, games, and fun.",
    parentId: CATEGORY_UUIDS.expense,
  },

  // Subcategories for Savings
  {
    slug: "emergency-fund",
    name: "Emergency Fund",
    type: "savings",
    color: "#c8e6c9",
    icon: "shield-check",
    description: "Savings for unexpected expenses.",
    parentId: CATEGORY_UUIDS.savings,
  },
  {
    slug: "vacation",
    name: "Vacation",
    type: "savings",
    color: "#b3e5fc",
    icon: "plane",
    description: "Money saved for travel and vacations.",
    parentId: CATEGORY_UUIDS.savings,
  },

  // Subcategories for Investments
  {
    slug: "stocks",
    name: "Stocks",
    type: "investments",
    color: "#d1c4e9",
    icon: "trending-up",
    description: "Investments in stock market.",
    parentId: CATEGORY_UUIDS.investments,
  },
  {
    slug: "bonds",
    name: "Bonds",
    type: "investments",
    color: "#cfd8dc",
    icon: "badge-percent",
    description: "Investments in bonds.",
    parentId: CATEGORY_UUIDS.investments,
  },

  // Subcategories for Transfer
  {
    slug: "transfer-in",
    name: "Transfer in",
    type: "transfer",
    color: "#f0f4c3",
    icon: "arrow-down-left",
    description: "Transfer into an account.",
    parentId: CATEGORY_UUIDS.transfer,
  },
  {
    slug: "transferm-out",
    name: "Transfer out",
    type: "transfer",
    color: "#f0f4c3",
    icon: "arrow-up-right",
    description: "Transfer out of an account.",
    parentId: CATEGORY_UUIDS.transfer,
  },
] as const;
