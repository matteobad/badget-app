import "server-only";

import { unstable_cache } from "next/cache";

import { type DB_BudgetType } from "~/server/db/schema/budgets";
import { type DB_CategoryType } from "~/server/db/schema/categories";
import {
  getCategories_QUERY,
  getCategoriesWithBudgets_QUERY,
  getTags_QUERY,
} from "./queries";

type CategoryType = DB_CategoryType & {
  budgets: DB_BudgetType[];
};

export const getCategories_CACHED = (userId: string) => {
  const cacheKeys = ["category", `category_${userId}`];

  return unstable_cache(
    async () => {
      const data = await getCategories_QUERY(userId);
      return data;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};

export const getCategoriesWithBudgets_CACHED = (userId: string) => {
  const cacheKeys = ["category", `category_${userId}`];

  return unstable_cache(
    async () => {
      const data = await getCategoriesWithBudgets_QUERY(userId);

      // NOTE: do whatever you want here, map, aggregate filter...
      // result will be cached and typesafety preserved
      const categories: CategoryType[] = [];

      for (const row of data) {
        const { budgets, ...rest } = row;
        const existing = categories.find((c) => c.id === row.id);

        if (!existing) {
          categories.push({
            ...rest,
            ...{ budgets: budgets ? [budgets] : [] },
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          budgets && existing.budgets.push(budgets);
        }
      }

      return categories;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};

export const getTags_CACHED = (userId: string) => {
  const cacheKeys = ["tag", `tag_${userId}`];

  return unstable_cache(
    async () => {
      const data = await getTags_QUERY(userId);
      return data;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};
