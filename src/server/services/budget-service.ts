import { addDays, format } from "date-fns";
import type z from "zod/v4";
import type {
  budgetFilterSchema,
  createBudgetSchema,
  deleteBudgetSchema,
  getBudgetsSchema,
  updateBudgetSchema,
} from "~/shared/validators/budget.schema";
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
  getBudgetsQuery,
  getMaterializedBudgetsQuery,
} from "../domain/budget/queries";
import type { getTransactionCategoriesQuery } from "../domain/transaction-category/queries";

export type CategoryType = Awaited<
  ReturnType<typeof getTransactionCategoriesQuery>
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
      return tot + Math.max(budgetTotal, childrenEffectiveTotal);
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
  orgId: string,
) {
  return await getBudgetsQuery({ ...input, orgId });
}

export async function getBudgetInstances(
  input: z.infer<typeof getBudgetsSchema>,
  orgId: string,
) {
  return await getMaterializedBudgetsQuery({ ...input, orgId });
}

export async function createBudget(
  params: z.infer<typeof createBudgetSchema>,
  orgId: string,
) {
  const input = toBudgetDBInput(params);

  return await withTransaction(async (tx) => {
    const result = await createBudgetMutation(tx, { ...input, userId: orgId });
    // refresh materialized view
    await refreshBudgetInstances(tx);

    return result;
  });
}

export async function updateBudget(
  params: z.infer<typeof updateBudgetSchema>,
  orgId: string,
) {
  const { id, isOverride, ...input } = params;

  // currently active budget
  const existingBudget = await getBudgetByIdQuery({ id });
  if (!existingBudget) throw new Error("Budget not found");
  console.log(`found budget ${id} for category: ${existingBudget.categoryId}`);

  // planned category budgets
  const categoryId = existingBudget.categoryId;
  const next = addDays(existingBudget.recurrenceEnd ?? existingBudget.to, 1);
  const planned = await getBudgetsQuery({ from: next, categoryId, orgId });
  console.log(`found ${planned.length} planned budgets on category`);

  // prepare data for updating budgets
  const prevEnd = getPrevCycleEnd(params.to, existingBudget.recurrence);
  const validity = buildValidity(input.from, input.to);

  return await withTransaction(async (tx) => {
    // close current budget on previous cycle
    const updated = await updateBudgetMutation(tx, {
      id,
      userId: orgId,
      recurrenceEnd: prevEnd,
    });

    if (!updated?.id) return tx.rollback();
    console.log(`close ${updated.id} on ${format(prevEnd, "yyyy-MM-dd")}`);

    // open new budget from current cycle
    const newBudget = await createBudgetMutation(tx, {
      ...(isOverride ? existingBudget : input),
      validity,
      categoryId,
      userId: orgId,
      id: undefined, // necessary to override existingBudget
    });

    if (!newBudget?.id) return tx.rollback();
    console.log(`open new budget ${newBudget.id}`);

    if (isOverride) {
      // create override budget on current cycle
      const overrideBudget = await createBudgetMutation(tx, {
        overrideForBudgetId: newBudget.id,
        amount: input.amount,
        validity,
        categoryId,
        userId: orgId,
      });

      if (!overrideBudget?.id) return tx.rollback();
      console.log(`override budget ${newBudget.id} with ${overrideBudget.id}`);
    }

    // delete planned category budget to avoid overlaps
    for (const { id } of planned) {
      await deleteBudgetMutation(tx, { id, userId: orgId });
      console.log(`deleted planned budget ${id}`);
    }

    // refresh materialized view
    await refreshBudgetInstances(tx);

    return await getBudgetByIdQuery({ id: updated.id });
  });
}

export async function deleteBudget(
  params: z.infer<typeof deleteBudgetSchema>,
  orgId: string,
) {
  return await deleteBudgetMutation(db, { ...params, userId: orgId });
}
