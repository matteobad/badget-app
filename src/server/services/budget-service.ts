import type {
  budgetFilterSchema,
  createBudgetSchema,
  deleteBudgetSchema,
  getBudgetsSchema,
  updateBudgetSchema,
} from "~/shared/validators/budget.schema";
import type z from "zod/v4";

import type { getBudgetsQuery } from "../domain/budget/queries";
import type { getCategoriesQuery } from "../domain/category/queries";
import { db, withTransaction } from "../db";
import {
  buildValidity,
  getBudgetForPeriod,
  getPrevCycleEnd,
  toBudgetDBInput,
} from "../domain/budget/helpers";
import {
  createBudgetMutation,
  deleteBudgetMutation,
  refreshBudgetInstances,
  updateBudgetMutation,
} from "../domain/budget/mutations";
import {
  getBudgetByIdQuery,
  getMaterializedBudgetsQuery,
} from "../domain/budget/queries";

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

    const parentTotal = Math.round(
      getBudgetForPeriod(parentBudgets, budgetFilters, {
        startOfWeek,
      }),
    );
    const childrenTotal = Math.round(getEffectiveChildrenTotal(parent.id));

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

export async function getBudgets(
  input: z.infer<typeof getBudgetsSchema>,
  userId: string,
) {
  return await getMaterializedBudgetsQuery({ ...input, userId });
}

export async function createBudget(
  params: z.infer<typeof createBudgetSchema>,
  userId: string,
) {
  const input = toBudgetDBInput(params);

  return await withTransaction(async (tx) => {
    const result = await createBudgetMutation(tx, { ...input, userId });
    // refresh materialized view
    await refreshBudgetInstances(tx);

    return result;
  });
}

export async function updateBudget(
  params: z.infer<typeof updateBudgetSchema>,
  userId: string,
) {
  const { id, categoryId, from, to, amount } = params;

  // currently active budget
  const existingBudget = await getBudgetByIdQuery({ id });
  if (!existingBudget) throw new Error("Budget not found");

  // planned category budgets
  const plannedBudgets = await getBudgets({ from, to, categoryId }, userId);
  console.log(`found ${plannedBudgets.length} planned budgets on category`);

  // prepare data for updating budgets
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { from: _, to: __, ...oldBudget } = existingBudget;
  const currentEnd = oldBudget.recurrenceEnd ?? params.to;
  const prevEnd = getPrevCycleEnd(currentEnd, oldBudget.recurrence);
  const validity = buildValidity(from, to);

  return await withTransaction(async (tx) => {
    // close current budget on previous cycle
    await updateBudgetMutation(tx, {
      ...oldBudget,
      recurrenceEnd: prevEnd,
    });

    // open new budget from current cycle
    const newBudget = await createBudgetMutation(tx, {
      ...oldBudget,
      validity,
      id: undefined,
      recurrenceEnd: null,
      userId,
    });

    if (!newBudget?.id) return tx.rollback();
    const { id: overrideForBudgetId } = newBudget;

    // create override budget on current cycle
    const overrideBudget = await createBudgetMutation(tx, {
      categoryId,
      validity,
      amount,
      overrideForBudgetId,
      userId,
    });

    // delete planned category budget to avoid overlaps
    for (const { id } of plannedBudgets) {
      await deleteBudgetMutation(tx, { id, userId });
    }

    // refresh materialized view
    await refreshBudgetInstances(tx);

    return overrideBudget;
  });
}

export async function deleteBudget(
  params: z.infer<typeof deleteBudgetSchema>,
  userId: string,
) {
  return await deleteBudgetMutation(db, { ...params, userId });
}
