import { InferInsertModel } from "drizzle-orm";

import { schema } from "..";
import { CategoryType } from "../schema/enum";

export const DEFAULT_CATEGORIES: Omit<
  InferInsertModel<typeof schema.categories>,
  "userId"
>[] = [
  {
    name: "Income",
    macro: "Income",
    type: CategoryType.INCOME,
    icon: "hand-coins",
  },
  {
    name: "Savings & Investments",
    macro: "Savings & Investments",
    type: CategoryType.SAVINGS_AND_INVESTMENTS,
    icon: "leaf",
  },
  {
    name: "Uncategorized",
    macro: "Outcome",
    type: CategoryType.OUTCOME,
    icon: "circle-dashed",
  },
  {
    name: "Transfers",
    macro: "Transfers",
    type: CategoryType.TRANSFERS,
    icon: "arrow-left-right",
  },
];
