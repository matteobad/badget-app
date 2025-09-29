"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { ReceiptIcon } from "lucide-react";

import { BaseWidget } from "./base";

export function MonthlySpendingWidget() {
  const trpc = useTRPC();
  const router = useRouter();

  // Calculate current month range
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const { data } = useQuery({
    ...trpc.widgets.getMonthlySpending.queryOptions({
      from: format(currentMonthStart, "yyyy-MM-dd"),
      to: format(currentMonthEnd, "yyyy-MM-dd"),
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const spending = data?.result;

  const getDescription = () => {
    if (!spending || spending.totalSpending === 0) {
      return "No expenses recorded this month";
    }

    if (spending.topCategory) {
      const percentage = spending.topCategory.percentage.toFixed(0);
      return `${spending.topCategory.name} makes up ${percentage}% of your spending`;
    }

    return "Track your monthly expenses";
  };

  const handleSeeExpenses = () => {
    router.push("/transactions?type=expense");
  };

  return (
    <BaseWidget
      title="Monthly Spending"
      icon={<ReceiptIcon className="size-4" />}
      description={getDescription()}
      onClick={handleSeeExpenses}
      actions="See biggest cost"
    >
      <div className="flex flex-1 items-end gap-2">
        {spending && spending.totalSpending > 0 && (
          <p className="text-2xl">
            {formatAmount({
              amount: spending.totalSpending,
              currency: spending.currency,
            })}
          </p>
        )}
      </div>
    </BaseWidget>
  );
}
