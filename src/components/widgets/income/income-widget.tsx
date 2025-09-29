"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatedNumber } from "~/components/animated-number";
import { Skeleton } from "~/components/ui/skeleton";
import { useSpaceQuery } from "~/hooks/use-space";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { TrendingUpIcon } from "lucide-react";

import {
  Widget,
  WidgetAction,
  WidgetContent,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
} from "../widget";

export function IncomeWidget() {
  const tIncome = useScopedI18n("widgets.income");

  const { data: space } = useSpaceQuery();

  const trpc = useTRPC();

  const { data: income, isLoading } = useQuery(
    trpc.reports.getIncomes.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  );

  return (
    <Widget>
      <WidgetHeader>
        <WidgetTitle className="flex items-center gap-3">
          <TrendingUpIcon className="size-4 text-muted-foreground" />
          {tIncome("title")}
        </WidgetTitle>
        <WidgetDescription>{tIncome("description")}</WidgetDescription>
      </WidgetHeader>

      {/* View mode */}
      <WidgetContent className="flex items-end">
        <span className="font-mono text-2xl font-medium">
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
      </WidgetContent>

      <WidgetFooter>
        <WidgetAction>{tIncome("action")}</WidgetAction>
      </WidgetFooter>
    </Widget>
  );
}
