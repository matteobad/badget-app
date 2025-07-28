import type {
  createCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  getCategoriesWithBudgetsSchema,
  updateCategorySchema,
} from "~/shared/validators/category.schema";
import type z from "zod/v4";
import { DEFAULT_CATEGORIES } from "~/shared/constants/categories";

import { db } from "../db";
import { getMaterializedBudgetsQuery } from "../domain/budget/queries";
import { buildCategoryAccrual } from "../domain/category/helpers";
import {
  createCategoryMutation,
  createManyCategoryMutation,
  deleteCategoryMutation,
  updateCategoryMutation,
} from "../domain/category/mutations";
import { getCategoriesQuery } from "../domain/category/queries";

export const mapCategoriesWithBudgets = (
  categories: Awaited<ReturnType<typeof getCategoriesQuery>>,
  budgets: Awaited<ReturnType<typeof getMaterializedBudgetsQuery>>,
) => {
  return categories.map((category) => {
    const categoryBudgets = budgets.filter((b) => b.categoryId === category.id);

    return {
      ...category,
      budgets: categoryBudgets,
      children: [] as string[],
    };
  });
};

export async function getCategories(
  filters: z.infer<typeof getCategoriesSchema>,
  userId: string,
) {
  return await getCategoriesQuery({ userId });
}

export async function getCategoriesWithBudgets(
  filters: z.infer<typeof getCategoriesWithBudgetsSchema>,
  userId: string,
) {
  const { from, to } = filters;
  // get all user categories
  const categories = await getCategoriesQuery({ userId });
  // get all user materialized budgets instances for requested period
  const budgets = await getMaterializedBudgetsQuery({ from, to, userId });
  // map categories with respective budgets instances
  // enriched data with accruals of category and childrens
  // enriched data with budget income percentage
  return buildCategoryAccrual(categories, budgets, { from, to });
}

export async function createCategory(
  params: z.infer<typeof createCategorySchema>,
  userId: string,
) {
  const [result] = await createCategoryMutation(db, { ...params, userId });
  return result;
}

export async function createDefaultCategories(userId: string) {
  const results = await createManyCategoryMutation(
    db,
    DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
  );
  return results;
}

export async function updateCategory(
  params: z.infer<typeof updateCategorySchema>,
  userId: string,
) {
  const [result] = await updateCategoryMutation(db, { ...params, userId });
  return result;
}

export async function deleteCategory(
  params: z.infer<typeof deleteCategorySchema>,
  userId: string,
) {
  const result = await deleteCategoryMutation(db, { ...params, userId });
  return result;
}
