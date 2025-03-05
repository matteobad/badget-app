import { useMemo } from "react";
import { isWithinInterval, subMonths } from "date-fns";
import {
  ArrowDown01Icon,
  EqualIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { type getCategories_CACHED } from "~/features/category/server/cached-queries";
import { type getTransactions_CACHED } from "~/features/transaction/server/cached-queries";
import { formatAmount } from "~/utils/format";
import { getChildCategoryIds } from "../utils";

type TransactionType = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];
type CategoryType = Awaited<ReturnType<typeof getCategories_CACHED>>[number];

export function ExpenseCard({
  dateRange,
  transactions,
  categories,
}: {
  dateRange: DateRange | undefined;
  transactions: TransactionType[];
  categories: CategoryType[];
}) {
  const categoryId = categories.find((c) => c.slug === "expense")!.id;
  const categoryIds = getChildCategoryIds(categories, categoryId);

  const { total, delta } = useMemo(() => {
    if (!dateRange?.from || !dateRange.to)
      return {
        total: 0,
        delta: 0,
      };

    const currentPeriod = {
      start: dateRange.from,
      end: dateRange.to,
    };

    const prevPeriod = {
      start: subMonths(dateRange.from, 1),
      end: subMonths(dateRange.to, 1),
    };

    const currentPeriodIncome = transactions
      .filter(({ date }) => isWithinInterval(date, currentPeriod))
      .filter(({ categoryId }) => categoryIds.includes(categoryId ?? ""))
      .map(({ amount }) => amount)
      .reduce((tot, value) => (tot += parseFloat(value)), 0);

    const prevPeriodIncome = transactions
      .filter(({ date }) => isWithinInterval(date, prevPeriod))
      .filter(({ categoryId }) => categoryIds.includes(categoryId ?? ""))

      .map(({ amount }) => amount)
      .reduce((tot, value) => (tot += parseFloat(value)), 0);

    return {
      total: currentPeriodIncome,
      delta: currentPeriodIncome / prevPeriodIncome,
    };
  }, [dateRange, categoryIds, transactions]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Uscite</CardTitle>
        <ArrowDown01Icon className="h-4 w-4 text-red-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatAmount({ amount: total })}
        </div>
        <p className="text-xs text-muted-foreground">
          {delta > 0 && (
            <span className="flex items-center text-emerald-500">
              <TrendingUpIcon className="mr-1 h-4 w-4" /> {delta.toFixed(2)} %
            </span>
          )}{" "}
          {delta < 0 && (
            <span className="flex items-center text-red-500">
              <TrendingDownIcon className="mr-1 h-4 w-4" /> {delta.toFixed(2)} %
            </span>
          )}{" "}
          {isNaN(delta) && (
            <span className="flex items-center text-slate-500">
              <EqualIcon className="mr-1 h-4 w-4" /> Stabile
            </span>
          )}{" "}
          rispetto al periodo precedente
        </p>
      </CardContent>
    </Card>
  );
}
