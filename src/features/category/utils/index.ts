import type { CategoryType } from "~/server/db/schema/enum";
import { CATEGORY_TYPE } from "~/server/db/schema/enum";

export const getCategoryListColors = (type: CategoryType) => {
  return {
    "border-green-100 text-green-700": type === CATEGORY_TYPE.INCOME,
    "border-red-100 text-red-700": type === CATEGORY_TYPE.EXPENSE,
    "border-violet-100 text-violet-700": type === CATEGORY_TYPE.SAVINGS,
    "border-blue-100 text-blue-700": type === CATEGORY_TYPE.INVESTMENTS,
    "border-neutral-100 text-neutral-700": type === CATEGORY_TYPE.TRANSFER,
  };
};

export const getBudgetTotalColor = (type: CategoryType, root: boolean) => {
  return {
    "text-green-700": type === CATEGORY_TYPE.INCOME && root,
    "text-green-500": type === CATEGORY_TYPE.INCOME && !root,
    "text-red-700": type === CATEGORY_TYPE.EXPENSE && root,
    "text-red-500": type === CATEGORY_TYPE.EXPENSE && !root,
    "text-violet-700": type === CATEGORY_TYPE.SAVINGS && root,
    "text-violet-500": type === CATEGORY_TYPE.SAVINGS && !root,
    "text-blue-700": type === CATEGORY_TYPE.INVESTMENTS && root,
    "text-blue-500": type === CATEGORY_TYPE.INVESTMENTS && !root,
    "text-neutral-700": type === CATEGORY_TYPE.TRANSFER && root,
    "text-neutral-500": type === CATEGORY_TYPE.TRANSFER && !root,
  };
};
