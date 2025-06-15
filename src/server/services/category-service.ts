import type { budgetFilterSchema } from "~/shared/validators/budget.schema";
import type { categoryFilterSchema } from "~/shared/validators/category.schema";
import type z from "zod/v4";

import { getBudgetsQuery } from "../domain/budget/queries";
import { getCategoriesQuery } from "../domain/category/queries";

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

export async function getCategoriesWithBudgets(
  categoryFilters: z.infer<typeof categoryFilterSchema>,
  budgetFilters: z.infer<typeof budgetFilterSchema>,
  userId: string,
) {
  const categories = await getCategoriesQuery(categoryFilters, userId);
  const budgets = await getBudgetsQuery(budgetFilters, userId);

  return mapCategoriesWithBudgets(categories, budgets);
}
