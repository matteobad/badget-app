import type { budgetFilterSchema } from "~/shared/validators/budget.schema";
import type z from "zod/v4";

import type { getBudgetsQuery } from "../domain/budget/queries";
import type { getCategoriesQuery } from "../domain/category/queries";
import { getBudgetForPeriod } from "../domain/budget/helpers";

export type CategoryType = Awaited<
  ReturnType<typeof getCategoriesQuery>
>[number];

export type BudgetType = Awaited<ReturnType<typeof getBudgetsQuery>>[number];

type BudgetWarning = {
  parentId: string;
  parentAmount: number;
  childrenTotal: number;
  excess: number; // quanto in più rispetto al budget del padre
};

export function findBudgetWarnings(
  categories: CategoryType[],
  budgets: BudgetType[],
  budgetFilters: z.infer<typeof budgetFilterSchema>,
  options?: { startOfWeek?: number },
): BudgetWarning[] {
  const { startOfWeek = 1 } = options ?? {};

  // Mappa genitore → figli
  const categoryMap = new Map<string, CategoryType[]>();
  for (const cat of categories) {
    if (!cat.parentId) continue;
    if (!categoryMap.has(cat.parentId)) {
      categoryMap.set(cat.parentId, []);
    }
    categoryMap.get(cat.parentId)!.push(cat);
  }

  // Ricorsione per ottenere tutti i discendenti
  function getAllDescendants(categoryId: string): string[] {
    const directChildren = categoryMap.get(categoryId) ?? [];
    return directChildren.flatMap((child) => [
      child.id,
      //...getAllDescendants(child.id),
    ]);
  }

  function getEffectiveChildrenTotal(categoryId: string): number {
    const descendantIds = getAllDescendants(categoryId);

    return descendantIds.reduce((tot, id) => {
      const childBudgets = budgets.filter((b) => b.categoryId === id);
      const budgetTotal = getBudgetForPeriod(childBudgets, budgetFilters, {
        startOfWeek,
      });
      const childrenEffectiveTotal = getEffectiveChildrenTotal(id);
      return (tot += Math.max(budgetTotal, childrenEffectiveTotal));
    }, 0);
  }

  const warnings: BudgetWarning[] = [];

  for (const parent of categories) {
    const parentBudgets = budgets.filter((b) => b.categoryId === parent.id);

    const parentTotal = getBudgetForPeriod(parentBudgets, budgetFilters, {
      startOfWeek,
    });
    const childrenTotal = getEffectiveChildrenTotal(parent.id);

    if (parentTotal && childrenTotal > parentTotal) {
      warnings.push({
        parentId: parent.id,
        parentAmount: parentTotal,
        childrenTotal,
        excess: childrenTotal - parentTotal,
      });
    }
  }

  return warnings;
}
