"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatedNumber } from "~/components/animated-number";
import { Skeleton } from "~/components/ui/skeleton";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { TrendingUpIcon } from "lucide-react";

import { BaseWidget } from "./base";

export function MonthlyIncomeWidget() {
  const tIncome = useScopedI18n("widgets.income");

  const { data: space } = useSpaceQuery();

  const trpc = useTRPC();

  const { data: income, isLoading } = useQuery({
    ...trpc.reports.getIncomes.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
      ...WIDGET_POLLING_CONFIG,
    }),
  });

  const handleClick = () => {
    // TODO: Navigate to cash flow analysis page
    console.log("View cash flow analysis clicked");
  };

  return (
    <BaseWidget
      title={tIncome("title")}
      icon={<TrendingUpIcon className="size-4 text-muted-foreground" />}
      description={tIncome("description")}
      actions={tIncome("action")}
      onClick={handleClick}
    >
      <div className="flex flex-1 items-end gap-2">
        <span className="text-2xl">
          {isLoading ? (
            <Skeleton className="h-[30px] w-[150px]" />
          ) : (
            <AnimatedNumber
              value={income?.summary.grossIncome ?? 0}
              currency={
                income?.summary.currency ?? space?.baseCurrency ?? "EUR"
              }
            />
          )}
        </span>
      </div>
    </BaseWidget>
  );
}
