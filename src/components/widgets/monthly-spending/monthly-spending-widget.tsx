"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatedNumber } from "~/components/animated-number";
import { useSpaceQuery } from "~/hooks/use-space";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { BanknoteArrowDownIcon } from "lucide-react";

import {
  Widget,
  WidgetAction,
  WidgetContent,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetProvider,
  WidgetSettingsTrigger,
  WidgetTitle,
} from "../widget";

type Props = {};

export function MonthlySpendingWidget(props: Props) {
  const { data: space } = useSpaceQuery();

  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.reports.getMonthlySpending.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  );

  const hasSettings = Object.keys(props).length > 0;

  return (
    <WidgetProvider>
      <Widget>
        <WidgetHeader>
          <WidgetTitle className="flex items-center gap-3">
            <BanknoteArrowDownIcon className="size-4 text-muted-foreground" />
            Monthly spending
          </WidgetTitle>
          <WidgetDescription>Spending this month</WidgetDescription>

          {hasSettings && <WidgetSettingsTrigger {...props} />}
        </WidgetHeader>

        <WidgetContent className="flex items-end">
          <span className="font-mono text-2xl font-medium">
            <AnimatedNumber
              value={data?.result?.spending ?? 0}
              currency={data?.summary.currency ?? space?.baseCurrency ?? "EUR"}
            />
          </span>
        </WidgetContent>

        <WidgetFooter>
          <WidgetAction>See biggest cost</WidgetAction>
        </WidgetFooter>
      </Widget>
    </WidgetProvider>
  );
}
