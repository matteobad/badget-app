"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useMetricsParams } from "~/hooks/use-metrics-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { format } from "date-fns";
import { InfoIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "../ui/chart";
import { AnimatedNumber } from "../animated-number";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { netWorthExamleData } from "./data";

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type Props = {
  disabled?: boolean;
};

export function NetWorthChart({ disabled }: Props) {
  const trpc = useTRPC();
  const { params } = useMetricsParams();

  const { data } = useQuery({
    ...trpc.metrics.netWorth.queryOptions({
      from: params.from,
      to: params.to,
      currency: params.currency ?? undefined,
    }),
    placeholderData: (previousData) => previousData ?? netWorthExamleData,
  });

  return (
    <div
      className={cn(
        disabled && "pointer-events-none opacity-20 blur-[8px] select-none",
      )}
    >
      <div className="mb-14 space-y-2 select-text">
        <h1 className="font-mono text-4xl">
          <AnimatedNumber
            value={data?.summary?.averageNetWorth ?? 0}
            currency={data?.summary?.currency ?? "EUR"}
          />
        </h1>

        <div className="flex items-center space-x-2 text-sm">
          <p className="text-sm">Average net worth</p>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="mt-1 h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent
                className="max-w-[240px] space-y-2 p-4 text-xs"
                side="bottom"
                sideOffset={10}
              >
                <h3 className="font-medium text-primary">
                  The Burn Rate is your monthly expenses divided by your current
                  balance, estimating how long your funds will last.
                </h3>
                <p>
                  Explanation: This tracks how fast you&apos;re spending. If
                  it&apos;s incorrect, internal transfers may be counted as
                  income. You can adjust this by excluding the transactions from
                  the calculations.
                </p>

                <p>
                  All amounts are converted into your{" "}
                  <Link href="/settings/accounts" className="underline">
                    base currency
                  </Link>
                  .
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[290px] w-full">
        <AreaChart accessibilityLayer data={data?.result ?? []}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stoke-[#DCDAD2] dark:stroke-[#2C2C2C]"
          />

          <ChartTooltip
            content={<ChartTooltipContent indicator="line" />}
            cursor={false}
          />

          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={15}
            interval={30}
            tickFormatter={(value: string) => {
              return format(new Date(value), "MMM");
            }}
            tick={{
              fill: "#606060",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
            }}
          />

          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{
              fill: "#606060",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
            }}
          />

          <Tooltip />

          <Area
            strokeWidth={2.5}
            type="monotone"
            dataKey="value"
            opacity={0.5}
            stroke="var(--color-ring)"
            fill="var(--color-ring)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
