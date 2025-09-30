"use client";

import { UTCDate } from "@date-fns/utc";
import { useQuery } from "@tanstack/react-query";
import { AnimatedNumber } from "~/components/animated-number";
import { Skeleton } from "~/components/ui/skeleton";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { TrendingUpIcon } from "lucide-react";

import { BaseWidget } from "./base";

export function MonthlyIncomeWidget() {
  const tIncome = useScopedI18n("widgets.income");

  const { data: space } = useSpaceQuery();

  const trpc = useTRPC();

  const { data, isLoading } = useQuery({
    ...trpc.widgets.getMonthlyIncome.queryOptions({
      from: startOfMonth(new UTCDate(new Date())).toISOString(),
      to: endOfMonth(new UTCDate(new Date())).toISOString(),
      currency: space?.baseCurrency ?? "EUR",
      ...WIDGET_POLLING_CONFIG,
    }),
  });

  const income = data?.result;

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
        {income && income.totalIncome > 0 && (
          <span className="text-2xl">
            <AnimatedNumber
              value={income.totalIncome}
              currency={income.currency}
            />
          </span>
        )}
      </div>
    </BaseWidget>
  );
}
