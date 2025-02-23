// import { type Category } from "..";
// import { CategoryType } from "../schema/enum";

import { type DB_CategoryInsertType } from "../schema/categories";

// const userId = "user_2jnV56cv1CJrRNLFsUdm6XAf7GD";

export const DEFAULT_CATEGORIES: DB_CategoryInsertType[] = [
  {
    name: "Income",
    slug: "income",
    color: "142.8 64.2% 24.1%", // green-800
    icon: "arrow-down-0-1",
    description: "Entrate e guadagni",
    userId: null,
  },
  {
    name: "Expense",
    slug: "expense",
    color: "0 84.2% 60.2%", // red-500
    icon: "arrow-up-0-1",
    description: "Spese e costi",
    userId: null,
  },
  {
    name: "Savings",
    slug: "savings",
    color: "48 89% 47%", // yellow-600
    icon: "piggy-bank",
    description: "Risparmi messi da parte",
    userId: null,
  },
  {
    name: "Investments",
    slug: "investments",
    color: "221.2 83.2% 53.3%", // blue-500
    icon: "line-chart",
    description: "Investimenti finanziari",
    userId: null,
  },
  {
    name: "Debt",
    slug: "debt",
    color: "276 55% 52%", // purple-500
    icon: "credit-card",
    description: "Prestiti e rimborsi",
    userId: null,
  },
  {
    name: "Transfers",
    slug: "transfers",
    color: "200 98% 39%", // cyan-600
    icon: "replace",
    description: "Movimenti tra conti",
    userId: null,
  },
];
