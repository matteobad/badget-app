"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatedNumber } from "~/components/animated-number";
import { Progress } from "~/components/ui/progress";
import { useSpaceQuery } from "~/hooks/use-space";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { ReceiptIcon, TrendingUpIcon } from "lucide-react";

import {
  Widget,
  WidgetAction,
  WidgetContent,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetProvider,
  WidgetSettings,
  WidgetSettingsTrigger,
  WidgetTitle,
} from "../widget";
import { IncomeWidgetSettingsForm } from "./income-widget-settings-form";

export function UncategorizedWidget() {
  const { data: space } = useSpaceQuery();

  // TODO: get income from trpc procedure with settings params
  // or get all and filter on client ?
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.reports.getUncategorized.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  );

  return (
    <WidgetProvider>
      <Widget>
        <WidgetHeader>
          <WidgetTitle className="flex items-center gap-3">
            <ReceiptIcon className="size-4 text-muted-foreground" />
            Uncategorized transactions
          </WidgetTitle>
        </WidgetHeader>

        <WidgetContent className="flex flex-col gap-2">
          <div className="text-sm">
            <span className="text-muted-foreground">You have </span>
            <span className="font-medium">
              {data?.result?.count ?? 0} uncategorized transaction{" "}
            </span>
            <span className="text-muted-foreground">for a total of </span>
            <span className="font-medium">
              {formatAmount({
                amount: data?.result?.total ?? 0,
                currency:
                  data?.summary.currency ?? space?.baseCurrency ?? "EUR",
              })}
            </span>
          </div>
        </WidgetContent>

        <WidgetFooter>
          <WidgetAction>See all uncategorized</WidgetAction>
        </WidgetFooter>
      </Widget>
    </WidgetProvider>
  );
}
