import type { budgetFilterSchema } from "~/shared/validators/budget.schema";
import type z from "zod/v4";

import type { getBudgetsQuery } from "./queries";

export type BudgetType = Awaited<ReturnType<typeof getBudgetsQuery>>[number];
export type BudgetFiltersType = z.infer<typeof budgetFilterSchema>;

export function getStartOfWeek(date: Date, startDay: number) {
  const day = date.getDay(); // 0 = Sunday, ..., 6 = Saturday
  const diff = (day - startDay + 7) % 7;
  const result = new Date(date);

  result.setDate(date.getDate() - diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

function calculateWeeklyBudget(
  budget: BudgetType,
  rangeStart: Date,
  rangeEnd: Date,
  startOfWeek: number,
) {
  const { startDate: from, endDate: to, amount } = budget;

  const effectiveStart = new Date(
    Math.max(from.getTime(), rangeStart.getTime()),
  );
  const effectiveEnd = new Date(
    Math.min(to?.getTime() ?? rangeEnd.getTime(), rangeEnd.getTime()),
  );

  let total = 0;
  const current = getStartOfWeek(effectiveStart, startOfWeek);

  while (current <= effectiveEnd) {
    const weekEnd = new Date(current);
    weekEnd.setDate(current.getDate() + 6);

    const overlapStart = new Date(
      Math.max(current.getTime(), effectiveStart.getTime()),
    );
    const overlapEnd = new Date(
      Math.min(weekEnd.getTime(), effectiveEnd.getTime()),
    );

    const overlapDays =
      (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24) +
      1;
    if (overlapDays > 0) {
      total += (amount * overlapDays) / 7;
    }

    current.setDate(current.getDate() + 7);
  }

  return total;
}

function calculateMonthlyBudget(budget: BudgetType, start: Date, end: Date) {
  let total = 0;
  const current = new Date(start);
  current.setDate(1);

  while (current <= end) {
    const monthStart = new Date(current);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    const overlapStart = new Date(
      Math.max(start.getTime(), monthStart.getTime()),
    );
    const overlapEnd = new Date(Math.min(end.getTime(), monthEnd.getTime()));

    if (overlapStart <= overlapEnd) {
      const daysInMonth = monthEnd.getDate();
      const overlappingDays =
        (overlapEnd.getTime() - overlapStart.getTime()) /
          (1000 * 60 * 60 * 24) +
        1;
      total += (budget.amount * overlappingDays) / daysInMonth;
    }

    current.setMonth(current.getMonth() + 1);
  }

  return total;
}

function calculateCustomBudget(budget: BudgetType, start: Date, end: Date) {
  const { startDate: from, endDate: to, amount } = budget;

  const effectiveEnd = to ?? end;
  const fullDuration =
    (effectiveEnd.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  const overlapStart = new Date(Math.max(from.getTime(), start.getTime()));
  const overlapEnd = new Date(Math.min(effectiveEnd.getTime(), end.getTime()));

  const overlapDays =
    (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24);

  if (fullDuration === 0 || overlapDays <= 0) return 0;
  return (amount * overlapDays) / fullDuration;
}

export function getBudgetForPeriod(
  budgets: BudgetType[],
  budgetFilters: BudgetFiltersType,
  options?: { startOfWeek?: number },
): number {
  const { from, to } = budgetFilters;
  const { startOfWeek = 1 } = options ?? {};

  return budgets.reduce((total, budget) => {
    switch (budget.period) {
      case "week":
        return total + calculateWeeklyBudget(budget, from, to, startOfWeek);
      case "month":
        return total + calculateMonthlyBudget(budget, from, to);
      case "custom":
        return total + calculateCustomBudget(budget, from, to);
      default:
        return total;
    }
  }, 0);
}
