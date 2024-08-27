import { type InferInsertModel } from "drizzle-orm";

import { type schema } from "..";
import { CategoryType } from "../schema/enum";

export const DEFAULT_CATEGORIES: Omit<
  InferInsertModel<typeof schema.category>,
  "userId"
>[] = [
  {
    name: "Income",
    macro: "Income",
    type: CategoryType.INCOME,
    icon: "hand-coins",
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
