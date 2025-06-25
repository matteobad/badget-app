import type { TreeDataItem } from "~/components/tree-view";
import type { TreeNode } from "~/shared/types";
import type { budgetFilterSchema } from "~/shared/validators/budget.schema";
import type { categoryFilterSchema } from "~/shared/validators/category.schema";
import type z from "zod/v4";
import { resolveMetadata } from "next/dist/lib/metadata/resolve-metadata";

import { getBudgetForPeriod } from "../domain/budget/helpers";
import { getBudgetsQuery } from "../domain/budget/queries";
import { getCategoriesQuery } from "../domain/category/queries";

type CategoryWithBudgetsType = Awaited<
  ReturnType<typeof getCategoriesWithBudgets>
>[number];

export const mapCategoriesWithBudgets = (
  categories: Awaited<ReturnType<typeof getCategoriesQuery>>,
  budgets: Awaited<ReturnType<typeof getBudgetsQuery>>,
) => {
  return categories.map((category) => {
    const categoryBudgets = budgets.filter((b) => b.categoryId === category.id);

    return {
      ...category,
      budgets: categoryBudgets,
    };
  });
};

export const enrichCategoryTree = (
  categoryTree: TreeNode<CategoryWithBudgetsType>[],
  budgetFilters: z.infer<typeof budgetFilterSchema>,
): TreeNode<
  CategoryWithBudgetsType & {
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

export const enrichTreeData = (
  categoryTree: TreeDataItem<CategoryWithBudgetsType>[],
  budgetFilters: z.infer<typeof budgetFilterSchema>,
): TreeDataItem<
  CategoryWithBudgetsType & {
    categoryBudget: number;
    childrenBudget: number;
  }
>[] => {
  return categoryTree.map((item) => {
    const { children, data: category, ...rest } = item;

    // 1. compute total budget for category (categoryBudget)
    const categoryBudget = getBudgetForPeriod(category.budgets, budgetFilters);

    // 2. recursively enrich children and compute their total budget (childrenBudget)
    const enrichedChildren = enrichTreeData(children ?? [], budgetFilters);
    const childrenBudget = enrichedChildren.reduce(
      (tot, childCategory) => tot + (childCategory.data.categoryBudget ?? 0),
      0,
    );

    return {
      ...rest,
      children: enrichedChildren,
      data: {
        ...category,
        categoryBudget, // budget for this category only
        childrenBudget, // budget for all children
      },
    };
  });
};

export async function getCategoriesWithBudgets(
  categoryFilters: z.infer<typeof categoryFilterSchema>,
  budgetFilters: z.infer<typeof budgetFilterSchema>,
  userId: string,
) {
  const categories = await getCategoriesQuery(categoryFilters, userId);
  const budgets = await getBudgetsQuery(budgetFilters, userId);

  return mapCategoriesWithBudgets(categories, budgets);
}
