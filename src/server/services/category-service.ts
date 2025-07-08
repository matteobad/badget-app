import type { TreeNode } from "~/shared/types";
import type { budgetFilterSchema } from "~/shared/validators/budget.schema";
import type {
  createCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
} from "~/shared/validators/category.schema";
import type z from "zod/v4";

import { CATEGORY_TYPE } from "../db/schema/enum";
import { getBudgetForPeriod } from "../domain/budget/helpers";
import { getBudgetsQuery } from "../domain/budget/queries";
import {
  createCategoryMutation,
  updateCategoryMutation,
} from "../domain/category/mutations";
import { getCategoriesQuery } from "../domain/category/queries";

type CategoryType = Awaited<ReturnType<typeof getCategoriesQuery>>[number];
type BudgetType = Awaited<ReturnType<typeof getBudgetsQuery>>[number];

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
  budgets: Awaited<ReturnType<typeof getBudgetsQuery>>,
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

export const enrichCategoryTree = (
  categoryTree: TreeNode<CategoryWithBudget>[],
  budgetFilters: z.infer<typeof budgetFilterSchema>,
): TreeNode<
  CategoryWithBudget & {
    categoryBudget: number;
    childrenBudget: number;
  }
>[] => {
  return categoryTree.map((item) => {
    const [category, children] = item;

    // 1. compute total budget for category (categoryBudget)
    const categoryBudget = getBudgetForPeriod(category.budgets, budgetFilters);

    // 2. recursively enrich children and compute their total budget (childrenBudget)
    const enrichedChildren = enrichCategoryTree(children, budgetFilters);
    const childrenBudget = enrichedChildren.reduce(
      (tot, [childCategory]) => tot + (childCategory.categoryBudget ?? 0),
      0,
    );

    return [
      {
        ...category,
        categoryBudget, // budget for this category only
        childrenBudget, // budget for all children
      },
      enrichedChildren,
    ];
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

export async function getCategoriesWithBudgets(
  categoryFilters: z.infer<typeof getCategoriesSchema>,
  budgetFilters: z.infer<typeof budgetFilterSchema>,
  userId: string,
) {
  const categories = await getCategoriesQuery(categoryFilters, userId);
  const budgets = await getBudgetsQuery({ ...budgetFilters, userId });

  const mappedData = mapCategoriesWithBudgets(categories, budgets);
  const enrichedData = enrichCategories(mappedData, budgetFilters);

  return enrichedData;
}

export async function getCategories(
  filters: z.infer<typeof getCategoriesSchema>,
  userId: string,
) {
  return await getCategoriesQuery(filters, userId);
}

export async function createCategory(
  params: z.infer<typeof createCategorySchema>,
  userId: string,
) {
  const [result] = await createCategoryMutation(params, userId);
  return result;
}

export async function updateCategory(
  params: z.infer<typeof updateCategorySchema>,
  userId: string,
) {
  const result = await updateCategoryMutation(params, userId);
  return result;
}
