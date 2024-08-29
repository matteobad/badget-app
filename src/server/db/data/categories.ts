import getUUID from "uuid-by-string";

import { type Category } from "..";
import { CategoryType } from "../schema/enum";

const userId = "user_2jnV56cv1CJrRNLFsUdm6XAf7GD";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: getUUID(`income_${userId}`),
    name: "Income",
    macro: "Income",
    type: CategoryType.INCOME,
    icon: "hand-coins",
    userId,
  },
  {
    id: getUUID(`outcome_${userId}`),
    name: "Outcome",
    macro: "Outcome",
    type: CategoryType.OUTCOME,
    icon: "circle-dashed",
    userId,
  },
  {
    id: getUUID(`transfers_${userId}`),
    name: "Transfer",
    macro: "Transfer",
    type: CategoryType.TRANSFER,
    icon: "arrow-left-right",
    userId,
  },
];
