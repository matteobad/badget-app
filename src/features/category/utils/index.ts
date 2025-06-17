import type { CategoryType } from "~/server/db/schema/enum";
import { CATEGORY_TYPE } from "~/server/db/schema/enum";

export const getIconColors = (type: CategoryType) => {
  return {
    "border-green-700 bg-green-100 text-green-700":
      type === CATEGORY_TYPE.INCOME,
    "border-red-700 bg-red-100 text-red-700": type === CATEGORY_TYPE.EXPENSE,
    "border-violet-700 bg-violet-100 text-violet-700":
      type === CATEGORY_TYPE.SAVINGS,
    "border-blue-700 bg-blue-100 text-blue-700":
      type === CATEGORY_TYPE.INVESTMENTS,
    "border-neutral-700 bg-neutral-100 text-neutral-700":
      type === CATEGORY_TYPE.TRANSFER,
  };
};

export const getCategoryListColors = (type: CategoryType) => {
  return {
    "border-green-100 text-green-700": type === CATEGORY_TYPE.INCOME,
    "border-red-100 text-red-700": type === CATEGORY_TYPE.EXPENSE,
    "border-violet-100 text-violet-700": type === CATEGORY_TYPE.SAVINGS,
    "border-blue-100 text-blue-700": type === CATEGORY_TYPE.INVESTMENTS,
    "border-neutral-100 text-neutral-700": type === CATEGORY_TYPE.TRANSFER,
  };
};
