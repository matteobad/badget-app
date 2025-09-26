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
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { BarChartIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ComposedChart } from "recharts";

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
  income: {
    label: "Income",
    color: "#10b981",
  },
  expenses: {
    label: "Expenses",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function IncomeAnalysisWidget() {
  const { data: space } = useSpaceQuery();
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.reports.getIncomeAnalysis.queryOptions({
      from: format(subMonths(startOfMonth(new Date()), 5), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  );

  return (
    <WidgetProvider>
      <Widget>
        <WidgetHeader>
          <WidgetTitle className="flex items-center gap-3">
            <BarChartIcon className="size-4 text-muted-foreground" />
            Income analysis
          </WidgetTitle>
          <WidgetDescription>
            <div className="text-sm">
              <span className="text-muted-foreground">
                Your average savings{" "}
              </span>
              <span className="font-medium text-primary">
                in {data?.result.length} month is{" "}
                {formatAmount({
                  amount: data?.summary?.averageSavings ?? 0,
                  currency:
                    data?.summary.currency ?? space?.baseCurrency ?? "EUR",
                  maximumFractionDigits: 0,
                })}{" "}
              </span>
            </div>
          </WidgetDescription>
        </WidgetHeader>

        <WidgetContent className="flex flex-col gap-2">
          <ChartContainer config={chartConfig} className="h-[60px] w-full">
            <BarChart
              accessibilityLayer
              data={data?.result}
              margin={{ left: -8, right: -8, top: 12 }}
            >
              <CartesianGrid
                strokeOpacity={0}
                vertical={false}
                className="stoke-[#DCDAD2] dark:stroke-[#2C2C2C]"
              />

              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
                cursor={false}
                formatter={(value: number, name: string) => {
                  return (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground capitalize">
                        {name}
                      </span>
                      <span className="text-right font-mono text-primary">
                        {formatAmount({
                          amount: value,
                          currency:
                            data?.summary.currency ??
                            space?.baseCurrency ??
                            "EUR",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  );
                }}
              />

              <Tooltip />

              <Bar barSize={16} dataKey="income" fill="var(--color-income)" />
              <Bar
                barSize={16}
                dataKey="expenses"
                fill="var(--color-expenses)"
              />
            </BarChart>
          </ChartContainer>
        </WidgetContent>

        <WidgetFooter>
          <WidgetAction>See detailed analysis</WidgetAction>
        </WidgetFooter>
      </Widget>
    </WidgetProvider>
  );
}
