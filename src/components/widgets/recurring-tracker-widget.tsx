"use client";

import { useQuery } from "@tanstack/react-query";
import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { CalendarSyncIcon } from "lucide-react";

import { BaseWidget } from "./base";

function RecurringWidgetSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-[150px]" />
        <Skeleton className="h-3 w-[80px]" />
      </div>
      <Skeleton className="h-4 w-full" />
    </>
  );
}

export function RecurringTrackerWidget() {
  const tRecurringTracker = useScopedI18n("widgets.recurring-tracker");

  const { data: space } = useSpaceQuery();

  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.reports.getRecurring.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
      ...WIDGET_POLLING_CONFIG,
    }),
  );

  const handleClick = () => {
    // TODO: Navigate to cash flow analysis page
    console.log("View cash flow analysis clicked");
  };

  return (
    <BaseWidget
      title={tRecurringTracker("title")}
      icon={<CalendarSyncIcon className="size-4 text-muted-foreground" />}
      description={
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {tRecurringTracker("content.label")}
          </span>
          <span className="text-sm">
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
      }
      actions={tRecurringTracker("action")}
      onClick={handleClick}
    >
      <div className="h-full flex-1">
        {isLoading ? (
          <RecurringWidgetSkeleton />
        ) : (
          <div className="flex flex-col gap-2">
            <Progress
              className="rounded-none"
              value={
                ((data?.result?.recurring ?? 1) / (data?.result?.total ?? 0)) *
                100
              }
            />
          </div>
        )}
      </div>
    </BaseWidget>
  );
}
