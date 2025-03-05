"use client";

import React from "react";
import { isWithinInterval } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import type { ChartConfig } from "~/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { type getCategories_CACHED } from "~/features/category/server/cached-queries";
import { type getTransactions_CACHED } from "~/features/transaction/server/cached-queries";
import { getChildCategoryIds } from "../../utils";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type TransactionType = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];
type CategoryType = Awaited<ReturnType<typeof getCategories_CACHED>>[number];

export function ExpensesDistributionChart({
  dateRange,
  transactions,
  categories,
}: {
  dateRange: DateRange | undefined;
  transactions: TransactionType[];
  categories: CategoryType[];
}) {
  const expenseId = categories.find((c) => c.slug === "expense")!.id;
  const expenseIds = getChildCategoryIds(categories, expenseId);

  const chartData = React.useMemo(() => {
    if (!dateRange?.from || !dateRange.to) return [];

    const currentPeriod = {
      start: dateRange.from,
      end: dateRange.to,
    };

    const expensesByCategory = transactions
      .filter(({ date }) => isWithinInterval(date, currentPeriod))
      .filter(({ categoryId }) => expenseIds.includes(categoryId ?? ""))
      .reduce(
        (acc, transaction) => {
          const category =
            categories.find((c) => c.id === transaction.categoryId)?.name ??
            "Other";
          const amount = parseFloat(transaction.amount);
          acc[category] = (acc[category] ?? 0) + amount;
          return acc;
        },
        {} as Record<string, number>,
      );

    const chartData = Object.entries(expensesByCategory).map(
      ([category, amount]) => ({
        category,
        amount: Math.abs(amount),
        fill: `var(--chart-${Math.floor(Math.random() * 5) + 1})`,
      }),
    );

    return chartData;
  }, [categories, dateRange, expenseIds, transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione spese</CardTitle>
        <CardDescription>
          Ripartizione delle spese per categoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div>Ancora nessuna spesa per questo periodo</div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value: string) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="amount" fill="var(--color-desktop)" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
