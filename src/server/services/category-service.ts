import type {
  createCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  getCategoriesWithBudgetsSchema,
  updateCategorySchema,
} from "~/shared/validators/category.schema";
import type z from "zod/v4";

import { db } from "../db";
import { getMaterializedBudgetsQuery } from "../domain/budget/queries";
import { buildCategoryAccrual } from "../domain/category/helpers";
import {
  createCategoryMutation,
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
  orgId: string,
) {
  return await getCategoriesQuery({ orgId });
}

export async function getCategoriesWithBudgets(
  filters: z.infer<typeof getCategoriesWithBudgetsSchema>,
  orgId: string,
) {
  const { from, to } = filters;
  // get all user categories
  const categories = await getCategoriesQuery({ orgId });
  // get all user materialized budgets instances for requested period
  const budgets = await getMaterializedBudgetsQuery({ from, to, orgId });
  // map categories with respective budgets instances
  // enriched data with accruals of category and childrens
  // enriched data with budget income percentage
  return buildCategoryAccrual(categories, budgets, { from, to });
}

export async function createCategory(
  params: z.infer<typeof createCategorySchema>,
  organizationId: string,
) {
  const [result] = await createCategoryMutation(db, {
    ...params,
    organizationId,
  });
  return result;
}

export async function updateCategory(
  params: z.infer<typeof updateCategorySchema>,
  organizationId: string,
) {
  const [result] = await updateCategoryMutation(db, {
    ...params,
    organizationId,
  });
  return result;
}

export async function deleteCategory(
  params: z.infer<typeof deleteCategorySchema>,
  orgId: string,
) {
  const result = await deleteCategoryMutation(db, { ...params, orgId });
  return result;
}
