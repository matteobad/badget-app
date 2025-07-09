import type {
  budgetFilterSchema,
  createBudgetSchema,
  deleteBudgetSchema,
  getBudgetSchema,
  updateBudgetSchema,
} from "~/shared/validators/budget.schema";
import type z from "zod/v4";

import type { getCategoriesQuery } from "../domain/category/queries";
import { db } from "../db";
import {
  diffBudgetUpdate,
  getBudgetForPeriod,
  getNextCycleStart,
  hasFutureBudget,
  toBudgetDBInput,
} from "../domain/budget/helpers";
import {
  createBudgetMutation,
  deleteBudgetMutation,
  updateBudgetMutation,
} from "../domain/budget/mutations";
import { getBudgetByIdQuery, getBudgetsQuery } from "../domain/budget/queries";

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
  input: z.infer<typeof getBudgetSchema>,
  userId: string,
) {
  return await getBudgetsQuery({ ...input, userId });
}

export async function createBudget(
  params: z.infer<typeof createBudgetSchema>,
  userId: string,
) {
  const input = toBudgetDBInput(params);
  return await createBudgetMutation(db, { ...input, userId });
}

export async function updateBudget(
  params: z.infer<typeof updateBudgetSchema>,
  userId: string,
) {
  const { id, ...rest } = params;

  // currently active budget
  const existing = await getBudgetByIdQuery({ id });
  if (!existing) throw new Error("Budget not found");

  // Fetch all budgets for this category and user (for future budget check)
  const allBudgets = await getBudgetsQuery({
    categoryId: existing.categoryId,
    userId,
  });

  // Compute what changed
  const diff = diffBudgetUpdate(existing, {
    amount: rest.amount,
    recurrence: rest.recurrence,
    from: rest.from,
    to: rest.repeat ? null : getNextCycleStart(rest.from, rest.recurrence),
  });

  // --- Only amount changed, and current period ---
  if (
    diff.amountChanged &&
    !diff.frequencyChanged &&
    !diff.repetitionChanged &&
    !diff.startDateChanged
  ) {
    // In-place update
    const input = toBudgetDBInput({
      categoryId: rest.categoryId,
      amount: rest.amount,
      recurrence: rest.recurrence,
      from: rest.from,
      repeat: rest.repeat,
    });
    return await updateBudgetMutation(db, { ...input, id, userId });
  }

  // --- Only repetition changed ---
  if (
    !diff.amountChanged &&
    !diff.frequencyChanged &&
    diff.repetitionChanged &&
    !diff.startDateChanged
  ) {
    // If making recurring, check for future budgets
    const makingRecurring = rest.repeat;
    if (makingRecurring) {
      const hasFuture = hasFutureBudget(
        allBudgets,
        existing.categoryId,
        existing.to ?? new Date(),
      );
      if (hasFuture) {
        throw new Error(
          "Cannot make this budget recurring: a future budget exists for this category. Please delete or update the future budget first.",
        );
      }
    }
    // Just update the range (open or close)
    const input = toBudgetDBInput({
      categoryId: rest.categoryId,
      amount: rest.amount,
      recurrence: rest.recurrence,
      from: rest.from,
      repeat: rest.repeat,
    });
    return await updateBudgetMutation(db, { ...input, id, userId });
  }

  // --- Any other change (frequency, startDate, or amount for future period, or multiple changes) ---
  // Close current at end of its cycle, create new with new params
  // 1. Close current
  const closeInput = toBudgetDBInput({
    categoryId: existing.categoryId,
    amount: existing.amount,
    recurrence: existing.recurrence,
    from: existing.from,
    repeat: false,
  });
  await updateBudgetMutation(db, { ...closeInput, id, userId });

  // 2. Create new budget
  // Determine new start date: next cycle or as specified
  const newFrom =
    rest.from ??
    getNextCycleStart(
      existing.to ?? new Date(),
      rest.recurrence ?? existing.recurrence,
    );
  const newBudgetInput = toBudgetDBInput({
    categoryId: rest.categoryId,
    amount: rest.amount,
    recurrence: rest.recurrence,
    from: newFrom,
    repeat: rest.repeat,
  });
  return await createBudgetMutation(db, {
    ...newBudgetInput,
    userId,
  });
}

export async function deleteBudget(
  params: z.infer<typeof deleteBudgetSchema>,
  userId: string,
) {
  return await deleteBudgetMutation(db, { ...params, userId });
}
