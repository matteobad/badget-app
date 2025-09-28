"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatedNumber } from "~/components/animated-number";
import { Skeleton } from "~/components/ui/skeleton";
import { useSpaceQuery } from "~/hooks/use-space";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { TrendingUpIcon } from "lucide-react";

import {
  useWidget,
  Widget,
  WidgetAction,
  WidgetContent,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetSettings,
  WidgetSettingsTrigger,
  WidgetTitle,
} from "../widget";
import { IncomeWidgetSettings } from "./income-widget-settings-form";

export function IncomeWidget() {
  const [amount, setAmount] = useState(0);
  const { data: space } = useSpaceQuery();

  const { settings } = useWidget();

  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.reports.getIncomes.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  );

  console.log(data);

  useEffect(() => {
    if (data) {
      setAmount(
        settings?.type === "gross"
          ? data.summary.grossIncome
          : data.summary.netIncome,
      );
    }
  }, [data, settings?.type]);

  return (
    <Widget>
      <WidgetHeader>
        <WidgetTitle className="flex items-center gap-3">
          <TrendingUpIcon className="size-4 text-muted-foreground" />
          Income this month
        </WidgetTitle>
        <WidgetDescription>Income</WidgetDescription>
        <WidgetSettingsTrigger />
      </WidgetHeader>

      {/* View mode */}
      <WidgetContent className="flex items-end">
        <span className="font-mono text-2xl font-medium">
          {isLoading ? (
            <Skeleton className="h-[30px] w-[150px]" />
          ) : (
            <AnimatedNumber
              value={amount}
              currency={data?.summary.currency ?? space?.baseCurrency ?? "EUR"}
            />
          )}
        </span>
      </WidgetContent>

      {/* Edit mode */}
      <WidgetSettings>
        <IncomeWidgetSettings />
      </WidgetSettings>

      <WidgetFooter>
        <WidgetAction>View income trends</WidgetAction>
      </WidgetFooter>
    </Widget>
  );
}
