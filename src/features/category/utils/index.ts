import {
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isBefore,
  isEqual,
  max,
  min,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";

import type { BudgetPeriod } from "~/server/db/schema/enum";

export const computeBudgetOfCompetence = (
  budget: {
    amount: string;
    period: BudgetPeriod;
    startDate: Date;
    endDate: Date | null;
  } | null,
  periodStart: Date,
  periodEnd: Date,
): number => {
  if (!budget) return 0;

  const { amount: rawAmount, period, startDate, endDate } = budget;
  const amount = parseFloat(rawAmount);
  const budgetStart = startDate;
  const budgetEnd = endDate ?? periodEnd;

  const intersectionStart = max([budgetStart, periodStart]);
  const intersectionEnd = min([budgetEnd, periodEnd]);

  if (intersectionStart > intersectionEnd) return 0;

  let total = 0;

  switch (period) {
    case "week": {
      let currentStart = startOfWeek(intersectionStart, { weekStartsOn: 1 });

      while (
        isBefore(currentStart, intersectionEnd) ||
        isEqual(currentStart, intersectionEnd)
      ) {
        const currentEnd = endOfWeek(currentStart, { weekStartsOn: 1 });

        const overlapStart = max([currentStart, intersectionStart]);
        const overlapEnd = min([currentEnd, intersectionEnd]);

        const overlapDays =
          differenceInCalendarDays(overlapEnd, overlapStart) + 1;
        if (overlapDays > 0) {
          total += (overlapDays / 7) * amount;
        }

        currentStart = addWeeks(currentStart, 1);
      }
      break;
    }

    case "month": {
      let currentStart = startOfMonth(intersectionStart);

      while (
        isBefore(currentStart, intersectionEnd) ||
        isEqual(currentStart, intersectionEnd)
      ) {
        const currentEnd = endOfMonth(currentStart);

        const overlapStart = max([currentStart, intersectionStart]);
        const overlapEnd = min([currentEnd, intersectionEnd]);

        const daysInMonth =
          differenceInCalendarDays(currentEnd, currentStart) + 1;
        const overlapDays =
          differenceInCalendarDays(overlapEnd, overlapStart) + 1;

        if (overlapDays > 0) {
          total += (overlapDays / daysInMonth) * amount;
        }

        currentStart = addMonths(currentStart, 1);
      }
      break;
    }

    case "year": {
      let currentStart = startOfYear(intersectionStart);

      while (
        isBefore(currentStart, intersectionEnd) ||
        isEqual(currentStart, intersectionEnd)
      ) {
        const currentEnd = endOfYear(currentStart);

        const overlapStart = max([currentStart, intersectionStart]);
        const overlapEnd = min([currentEnd, intersectionEnd]);

        const daysInYear =
          differenceInCalendarDays(currentEnd, currentStart) + 1;
        const overlapDays =
          differenceInCalendarDays(overlapEnd, overlapStart) + 1;

        if (overlapDays > 0) {
          total += (overlapDays / daysInYear) * amount;
        }

        currentStart = addYears(currentStart, 1);
      }
      break;
    }

    case "custom": {
      const totalDays = differenceInCalendarDays(budgetEnd, budgetStart) + 1;
      const overlapDays =
        differenceInCalendarDays(intersectionEnd, intersectionStart) + 1;

      if (totalDays > 0 && overlapDays > 0) {
        total += (overlapDays / totalDays) * amount;
      }
      break;
    }
  }

  return total;
};
