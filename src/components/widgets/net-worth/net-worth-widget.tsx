"use client";

import type { ChartConfig } from "~/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Tooltip } from "~/components/ui/tooltip";
import { useSpaceQuery } from "~/hooks/use-space";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { LineChartIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid } from "recharts";

import {
  Widget,
  WidgetAction,
  WidgetContent,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetProvider,
  WidgetTitle,
} from "../widget";

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function NetWorthWidget() {
  const { data: space } = useSpaceQuery();
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.reports.getNetWorth.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  );

  return (
    <WidgetProvider>
      <Widget>
        <WidgetHeader>
          <WidgetTitle className="flex items-center gap-3">
            <LineChartIcon className="size-4 text-muted-foreground" />
            Net worth
          </WidgetTitle>
          <WidgetDescription>
            <div className="text-sm">
              <span className="text-muted-foreground">Your </span>
              <span className="font-medium text-primary">
                net worth is{" "}
                {formatAmount({
                  amount: data?.summary?.netWorth ?? 0,
                  currency:
                    data?.summary.currency ?? space?.baseCurrency ?? "EUR",
                })}{" "}
              </span>
            </div>
          </WidgetDescription>
        </WidgetHeader>

        <WidgetContent className="flex flex-col gap-2">
          <ChartContainer config={chartConfig} className="h-[60px] w-full">
            <AreaChart accessibilityLayer data={data?.result ?? []}>
              <CartesianGrid
                strokeOpacity="0"
                vertical={false}
                className="stoke-[#DCDAD2] dark:stroke-[#2C2C2C]"
              />

              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
                cursor={false}
              />

              <Tooltip />

              <Area
                strokeWidth={2.5}
                type="monotone"
                dataKey="value"
                opacity={0.5}
                stroke="var(--color-ring)"
                fill="transparent"
              />
            </AreaChart>
          </ChartContainer>
        </WidgetContent>

        <WidgetFooter>
          <WidgetAction>See trend</WidgetAction>
        </WidgetFooter>
      </Widget>
    </WidgetProvider>
  );
}
