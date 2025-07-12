import type { budgetFilterSchema } from "~/shared/validators/budget.schema";
import type {
  createCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  getCategoriesWithBudgetsSchema,
  updateCategorySchema,
} from "~/shared/validators/category.schema";
import type z from "zod/v4";

import { db } from "../db";
import { CATEGORY_TYPE } from "../db/schema/enum";
import { getBudgetForPeriod } from "../domain/budget/helpers";
import { getMaterializedBudgetsQuery } from "../domain/budget/queries";
import { buildCategoryAccrualTree } from "../domain/category/helpers";
import {
  createCategoryMutation,
  deleteCategoryMutation,
  updateCategoryMutation,
} from "../domain/category/mutations";
import { getCategoriesQuery } from "../domain/category/queries";

type CategoryType = Awaited<ReturnType<typeof getCategoriesQuery>>[number];
type BudgetType = Awaited<
  ReturnType<typeof getMaterializedBudgetsQuery>
>[number];

type CategoryWithBudget = CategoryType & {
  budgets: BudgetType[];
  children: string[];
};
type CategoryWithBudgetEnriched = CategoryWithBudget & {
  categoryBudget: number;
  childrenBudget: number;
  perc: number;
};

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

export const enrichCategories = (
  categoriesWithBudgets: CategoryWithBudget[],
  budgetFilters: z.infer<typeof budgetFilterSchema>,
): CategoryWithBudgetEnriched[] => {
  const totalIncome = getBudgetForPeriod(
    categoriesWithBudgets.find(
      (c) => !c.parentId && c.type === CATEGORY_TYPE.INCOME,
    )?.budgets ?? [],
    budgetFilters,
  );

  return categoriesWithBudgets.map((item) => {
    const { budgets, id } = item;
    // 1. compute total budget for category (categoryBudget)
    const categoryBudget = getBudgetForPeriod(budgets, budgetFilters);

    // 2. recursively enrich children and compute their total budget (childrenBudget)
    const children = categoriesWithBudgets.filter((c) => c.parentId === id);
    const enrichedChildren = enrichCategories(children ?? [], budgetFilters);
    const childrenBudget = enrichedChildren.reduce(
      (tot, { categoryBudget }) => tot + (categoryBudget ?? 0),
      0,
    );

    return {
      ...item,
      categoryBudget, // budget for this category only
      childrenBudget, // budget for all children
      perc: Math.max(categoryBudget, childrenBudget) / totalIncome,
    };
  });
};

export async function getCategories(
  filters: z.infer<typeof getCategoriesSchema>,
  userId: string,
) {
  return await getCategoriesQuery({ ...filters, userId });
}

export async function getCategoriesWithBudgets(
  filters: z.infer<typeof getCategoriesWithBudgetsSchema>,
  userId: string,
) {
  const { from, to } = filters;
  const categories = await getCategoriesQuery({ userId });
  const budgets = await getMaterializedBudgetsQuery({ from, to, userId });

  return buildCategoryAccrualTree(categories, budgets, { from, to });
  // const mappedData = mapCategoriesWithBudgets(categories, budgets);
  // const enrichedData = enrichCategories(mappedData, { from, to });

  // return enrichedData;
}

export async function createCategory(
  params: z.infer<typeof createCategorySchema>,
  userId: string,
) {
  const [result] = await createCategoryMutation(db, { ...params, userId });
  return result;
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
