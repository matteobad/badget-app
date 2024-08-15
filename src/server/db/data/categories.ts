import { InferInsertModel } from "drizzle-orm";

import { schema } from "..";
import { CategoryType } from "../schema/enum";

export const DEFAULT_CATEGORIES: Omit<
  InferInsertModel<typeof schema.categories>,
  "userId"
>[] = [
  {
    name: "Income",
    type: CategoryType.INCOME,
    icon: "hand-coins",
  },
  {
    name: "Rent or Mortgage",
    type: CategoryType.FIXED_COSTS,
    icon: "house",
  },
  {
    name: "Car",
    type: CategoryType.FIXED_COSTS,
    icon: "car",
  },
  {
    name: "Loans",
    type: CategoryType.FIXED_COSTS,
    icon: "credit-card",
  },
  {
    name: "Emergency fund",
    type: CategoryType.SAVING_AND_INVESTMENTS,
    icon: "cross",
  },
  {
    name: "Pension",
    type: CategoryType.SAVING_AND_INVESTMENTS,
    icon: "leaf",
  },
  {
    name: "Investments",
    type: CategoryType.SAVING_AND_INVESTMENTS,
    icon: "chart-candlestick",
  },
  {
    name: "Groceries",
    type: CategoryType.CATEGORY_BUDGETS,
    icon: "cooking-pot",
  },
  {
    name: "Lifestyle",
    type: CategoryType.CATEGORY_BUDGETS,
    icon: "party-popper",
  },
  {
    name: "Travel & Holidays",
    type: CategoryType.CATEGORY_BUDGETS,
    icon: "plane",
  },
  {
    name: "Transfers",
    type: CategoryType.TRANSFERS,
    icon: "arrow-left-right",
  },
];
