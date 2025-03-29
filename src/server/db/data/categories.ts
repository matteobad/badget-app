// import { type Category } from "..";
// import { CategoryType } from "../schema/enum";

import { createId } from "@paralleldrive/cuid2";
import { endOfMonth, startOfMonth } from "date-fns";
import { type dynamicIconImports } from "lucide-react/dynamic";

import { type DB_BudgetInsertType } from "../schema/budgets";
import { type DB_CategoryInsertType } from "../schema/categories";
import { BudgetPeriod, CATEGORY_TYPE } from "../schema/enum";

// const userId = "user_2jnV56cv1CJrRNLFsUdm6XAf7GD";

export const categoryIcons = [
  "shopping-bag",
  "utensils",
  "car",
  "bus",
  "train",
  "plane",
  "home",
  "building",
  "dumbbell",
  "stethoscope",
  "pill",
  "heartbeat",
  "baby",
  "graduation-cap",
  "book",
  "briefcase",
  "coffee",
  "beer",
  "wine",
  "gift",
  "gamepad",
  "tv",
  "music",
  "headphones",
  "camera",
  "phone",
  "laptop",
  "server",
  "wrench",
  "tools",
  "credit-card",
  "banknote",
  "piggy-bank",
  "wallet",
  "receipt",
  "shopping-cart",
  "leaf",
  "sun",
  "flower",
  "paw-print",
  "hand-heart",
  "users",
  "globe",
  "plane-takeoff",
  "plane-landing",
  "file-text",
  "file-invoice",
  "alarm-clock",
  "calendar",
  "heart",
  "sparkles",
] as Array<keyof typeof dynamicIconImports>;

const incomeId = createId();
const expenseId = createId();
const savingsId = createId();
const investmentsId = createId();
const transfersId = createId();

// Root categories (Level 0)
export const ROOT_CATEGORIES: DB_CategoryInsertType[] = [
  {
    id: incomeId,
    name: "Income",
    slug: "income",
    type: CATEGORY_TYPE.INCOME,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: expenseId,
    name: "Expense",
    slug: "expense",
    type: CATEGORY_TYPE.EXPENSE,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: savingsId,
    name: "Savings",
    slug: "savings",
    type: CATEGORY_TYPE.SAVINGS,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: investmentsId,
    name: "Investments",
    slug: "investments",
    type: CATEGORY_TYPE.INVESTMENT,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: transfersId,
    name: "Transfer",
    slug: "transfer",
    type: CATEGORY_TYPE.TRANSFER,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
] as const;

// Subcategories (Level 1)
export const SUB_CATEGORIES: DB_CategoryInsertType[] = [
  // Income subcategories
  {
    id: createId(),
    name: "Salary",
    description: "Working salary",
    color: "oklch(0.723 0.219 149.579)",
    icon: "hand-coins",
    slug: "salary",
    type: CATEGORY_TYPE.INCOME,
    parentId: incomeId,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: createId(),
    name: "Side Income",
    description: "Freelance and other side income",
    color: "oklch(0.723 0.219 149.579)",
    icon: "briefcase",
    slug: "side-income",
    type: CATEGORY_TYPE.INCOME,
    parentId: incomeId,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },

  // Expense subcategories
  {
    id: createId(),
    name: "Housing",
    description: "Rent, mortgage and utilities",
    color: "oklch(0.723 0.219 149.579)",
    icon: "home",
    slug: "housing",
    type: CATEGORY_TYPE.EXPENSE,
    parentId: expenseId,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: createId(),
    name: "Transportation",
    description: "Car, public transport and fuel",
    color: "oklch(0.723 0.219 149.579)",
    icon: "car",
    slug: "transportation",
    type: CATEGORY_TYPE.EXPENSE,
    parentId: expenseId,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: createId(),
    name: "Food",
    description: "Groceries and dining out",
    color: "oklch(0.723 0.219 149.579)",
    icon: "utensils",
    slug: "food",
    type: CATEGORY_TYPE.EXPENSE,
    parentId: expenseId,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: createId(),
    name: "Healthcare",
    description: "Medical expenses and insurance",
    color: "oklch(0.723 0.219 149.579)",
    icon: "heart-pulse",
    slug: "healthcare",
    type: CATEGORY_TYPE.EXPENSE,
    parentId: expenseId,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: createId(),
    name: "Entertainment",
    description: "Recreation and leisure activities",
    color: "oklch(0.723 0.219 149.579)",
    icon: "gamepad-2",
    slug: "entertainment",
    type: CATEGORY_TYPE.EXPENSE,
    parentId: expenseId,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },

  // Savings subcategories
  {
    id: createId(),
    name: "Emergency Fund",
    description: "Emergency savings",
    color: "oklch(0.723 0.219 149.579)",
    icon: "shield-alert",
    slug: "emergency-fund",
    type: CATEGORY_TYPE.SAVINGS,
    parentId: savingsId,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: createId(),
    name: "Major Purchases",
    description: "Saving for big purchases",
    color: "oklch(0.723 0.219 149.579)",
    icon: "shopping-cart",
    slug: "major-purchases",
    type: CATEGORY_TYPE.SAVINGS,
    parentId: savingsId,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },

  // Investment subcategories
  {
    id: createId(),
    name: "Stocks",
    description: "Stock market investments",
    color: "oklch(0.723 0.219 149.579)",
    icon: "line-chart",
    slug: "stocks",
    type: CATEGORY_TYPE.INVESTMENT,
    parentId: investmentsId,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
] as const;

// Subcategories (Level 2)
export const SUB_CATEGORIES_2: DB_CategoryInsertType[] = [
  // Income subcategories
  {
    id: createId(),
    name: "Groceries",
    description: "Groceries",
    color: "oklch(0.723 0.219 149.579)",
    icon: "shopping-basket",
    slug: "groceries",
    type: CATEGORY_TYPE.EXPENSE,
    parentId: SUB_CATEGORIES[4]!.id,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
  {
    id: createId(),
    name: "Dining out",
    description: "Dining out",
    color: "oklch(0.723 0.219 149.579)",
    icon: "hand-platter",
    slug: "dining-out",
    type: CATEGORY_TYPE.EXPENSE,
    parentId: SUB_CATEGORIES[4]!.id,
    userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
  },
] as const;

// Category budgets
export const SUB_CATEGORIES_BUDGETS: DB_BudgetInsertType[] = SUB_CATEGORIES.map(
  (cat) => {
    return {
      id: createId(),
      categoryId: cat.id,
      name: cat.name + " budget",
      amount: (Math.floor(Math.random() * (1000 - 50 + 1)) + 50).toFixed(2),
      period: BudgetPeriod.MONTHLY,
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      userId: "user_2jnV56cv1CJrRNLFsUdm6XAf7GD",
    };
  },
);
