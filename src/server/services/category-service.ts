import type { budgetFilterSchema } from "~/shared/validators/budget.schema";
import type { categoryFilterSchema } from "~/shared/validators/category.schema";
import type z from "zod/v4";
import { differenceInCalendarDays, max, min } from "date-fns";

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

export const enrichCategoryBudgets = (
  categoryWithBudgets: ReturnType<typeof mapCategoriesWithBudgets>[number],
  budgetFilters: z.infer<typeof budgetFilterSchema>,
) => {
  const { from: periodFrom, to: periodTo } = budgetFilters;

  // TODO: fix and test this
  const total = categoryWithBudgets.budgets.reduce((tot, budget) => {
    const { startDate: budgetFrom, endDate: budgetTo, amount } = budget;

    const intersectionStart = max([budgetFrom, periodFrom]);
    const intersectionEnd = min([budgetTo, periodTo]);
    const totalDays = differenceInCalendarDays(budgetTo, budgetFrom) + 1;
    const overlapDays =
      differenceInCalendarDays(intersectionEnd, intersectionStart) + 1;

    return (tot +=
      totalDays > 0 && overlapDays > 0
        ? (overlapDays / totalDays) * parseFloat(amount)
        : 0);
  }, 0);

  return {
    ...categoryWithBudgets,
    budgetTotal: total,
  };
};

export async function getCategoriesWithBudgets(
  categoryFilters: z.infer<typeof categoryFilterSchema>,
  budgetFilters: z.infer<typeof budgetFilterSchema>,
  userId: string,
) {
  const categories = await getCategoriesQuery(categoryFilters, userId);
  const budgets = await getBudgetsQuery(budgetFilters, userId);

  const categoriesWithbudgets = mapCategoriesWithBudgets(categories, budgets);

  return categoriesWithbudgets.map((categoryWithBudgets) =>
    enrichCategoryBudgets(categoryWithBudgets, budgetFilters),
  );
}
