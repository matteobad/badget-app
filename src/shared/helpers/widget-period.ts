import type { WidgetPeriod } from "~/server/cache/widget-preferences-cache";
import type { Day } from "date-fns";
import { UTCDate } from "@date-fns/utc";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";

import { getFiscalYearToDate } from "./fiscal-year";

interface DateRange {
  from: string; // ISO string
  to: string; // ISO string
}

/**
 * Get date range based on widget period and fiscal year settings
 */
export function getWidgetPeriodDates(
  period: WidgetPeriod | undefined,
  fiscalYearStartMonth: number | null | undefined,
  weekStartsOn: Day = 1,
  referenceDate = new UTCDate(new Date()),
): DateRange {
  switch (period) {
    case "this_month": {
      const from = startOfMonth(referenceDate);
      const to = endOfMonth(referenceDate);
      return {
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      };
    }

    case "last_month": {
      const from = subMonths(startOfMonth(referenceDate), 1);
      const to = subMonths(endOfMonth(referenceDate), 1);
      return {
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      };
    }

    case "this_week": {
      const from = startOfWeek(referenceDate, { weekStartsOn });
      const to = endOfWeek(referenceDate, { weekStartsOn });
      return {
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      };
    }

    case "last_week": {
      const from = subWeeks(startOfWeek(referenceDate, { weekStartsOn }), 1);
      const to = subWeeks(endOfWeek(referenceDate, { weekStartsOn }), 1);
      return {
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      };
    }

    case "this_year": {
      const { from, to } = getFiscalYearToDate(
        fiscalYearStartMonth,
        referenceDate,
      );
      return {
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      };
    }

    case "last_3_months": {
      const from = subMonths(startOfMonth(referenceDate), 2);
      const to = endOfMonth(referenceDate);
      return {
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      };
    }

    case "last_6_months": {
      const from = subMonths(startOfMonth(referenceDate), 5);
      const to = endOfMonth(referenceDate);
      return {
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      };
    }

    case "last_12_months": {
      const from = subMonths(startOfMonth(referenceDate), 11);
      const to = endOfMonth(referenceDate);
      return {
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      };
    }

    default: {
      // Default to this month
      const from = startOfMonth(referenceDate);
      const to = endOfMonth(referenceDate);
      return {
        from: format(from, "yyyy-MM-dd"),
        to: format(to, "yyyy-MM-dd"),
      };
    }
  }
}
