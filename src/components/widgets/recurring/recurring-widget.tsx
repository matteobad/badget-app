"use client";

import { useQuery } from "@tanstack/react-query";
import { Progress } from "~/components/ui/progress";
import { useSpaceQuery } from "~/hooks/use-space";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { CalendarSyncIcon } from "lucide-react";

import {
  Widget,
  WidgetAction,
  WidgetContent,
  WidgetFooter,
  WidgetHeader,
  WidgetProvider,
  WidgetTitle,
} from "../widget";

export function RecurringWidget() {
  const { data: space } = useSpaceQuery();

  // TODO: get income from trpc procedure with settings params
  // or get all and filter on client ?
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.reports.getRecurring.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  );

  return (
    <WidgetProvider>
      <Widget>
        <WidgetHeader>
          <WidgetTitle className="flex items-center gap-3">
            <CalendarSyncIcon className="size-4 text-muted-foreground" />
            Recurring
          </WidgetTitle>
        </WidgetHeader>

        <WidgetContent className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Recurring this month
            </span>
            <span className="text-xs">
              {formatAmount({
                amount: data?.result?.recurring ?? 0,
                currency: data?.meta.currency ?? space?.baseCurrency ?? "EUR",
                maximumFractionDigits: 0,
              })}
              <span className="px-1 text-muted-foreground">/</span>

              {formatAmount({
                amount: data?.result?.total ?? 0,
                currency: data?.meta.currency ?? space?.baseCurrency ?? "EUR",
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="flex h-3 w-full items-center gap-2 bg-neutral-100">
            <Progress
              className="rounded-none"
              value={
                ((data?.result?.recurring ?? 1) / (data?.result?.total ?? 0)) *
                100
              }
            />
          </div>
        </WidgetContent>

        <WidgetFooter>
          <WidgetAction>Open tracker</WidgetAction>
        </WidgetFooter>
      </Widget>
    </WidgetProvider>
  );
}
