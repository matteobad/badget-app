"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatedNumber } from "~/components/animated-number";
import { Skeleton } from "~/components/ui/skeleton";
import { useSpaceQuery } from "~/hooks/use-space";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { TrendingDownIcon } from "lucide-react";

import {
  Widget,
  WidgetAction,
  WidgetContent,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
} from "../widget";

export function MonthlySpendingWidget() {
  const tMonthlySpending = useScopedI18n("widgets.monthly-spending");

  const { data: space } = useSpaceQuery();

  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.reports.getMonthlySpending.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  );

  return (
    <Widget>
      <WidgetHeader>
        <WidgetTitle className="flex items-center gap-3">
          <TrendingDownIcon className="size-4 text-muted-foreground" />
          {tMonthlySpending("title")}
        </WidgetTitle>
        <WidgetDescription>{tMonthlySpending("description")}</WidgetDescription>
      </WidgetHeader>

      {/* View mode */}
      <WidgetContent className="flex items-end">
        <span className="font-mono text-2xl font-medium">
          {isLoading ? (
            <Skeleton className="h-[30px] w-[150px]" />
          ) : (
            <AnimatedNumber
              value={data?.result?.spending ?? 0}
              currency={data?.summary.currency ?? space?.baseCurrency ?? "EUR"}
            />
          )}
        </span>
      </WidgetContent>

      <WidgetFooter>
        <WidgetAction>{tMonthlySpending("action")}</WidgetAction>
      </WidgetFooter>
    </Widget>
  );
}
