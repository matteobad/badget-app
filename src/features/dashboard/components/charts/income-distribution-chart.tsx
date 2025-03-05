"use client";

import * as React from "react";
import { isWithinInterval } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Label, Pie, PieChart } from "recharts";

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
import { formatAmount } from "~/utils/format";
import { getChildCategoryIds } from "../../utils";

const chartConfig = {
  total: {
    label: "Importo",
  },
  income: {
    label: "Restante",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Spese",
    color: "var(--chart-2)",
  },
  savings: {
    label: "Risparmi",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

type TransactionType = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];
type CategoryType = Awaited<ReturnType<typeof getCategories_CACHED>>[number];

export function IncomeDistributionChart({
  dateRange,
  transactions,
  categories,
}: {
  dateRange: DateRange | undefined;
  transactions: TransactionType[];
  categories: CategoryType[];
}) {
  const incomeid = categories.find((c) => c.slug === "income")!.id;
  const incomeIds = getChildCategoryIds(categories, incomeid);
  const expenseid = categories.find((c) => c.slug === "expense")!.id;
  const expenseIds = getChildCategoryIds(categories, expenseid);
  const savingsid = categories.find((c) => c.slug === "savings")!.id;
  const savingsIds = getChildCategoryIds(categories, savingsid);

  const chartData = React.useMemo(() => {
    if (!dateRange?.from || !dateRange.to) return [];

    const currentPeriod = {
      start: dateRange.from,
      end: dateRange.to,
    };

    const income = transactions
      .filter(({ date }) => isWithinInterval(date, currentPeriod))
      .filter(({ categoryId }) => incomeIds.includes(categoryId ?? ""))
      .map(({ amount }) => amount)
      .reduce((tot, value) => (tot += parseFloat(value)), 0);

    const expense = transactions
      .filter(({ date }) => isWithinInterval(date, currentPeriod))
      .filter(({ categoryId }) => expenseIds.includes(categoryId ?? ""))
      .map(({ amount }) => amount)
      .reduce((tot, value) => (tot += parseFloat(value)), 0);

    const savings = transactions
      .filter(({ date }) => isWithinInterval(date, currentPeriod))
      .filter(({ categoryId }) => savingsIds.includes(categoryId ?? ""))
      .map(({ amount }) => amount)
      .reduce((tot, value) => (tot += parseFloat(value)), 0);

    return [
      { category: "expense", amount: expense, fill: "var(--color-expense)" },
      { category: "savings", amount: savings, fill: "var(--color-savings)" },
      {
        category: "income",
        amount: income - expense - savings,
        fill: "var(--color-income)",
      },
    ];
  }, [dateRange, expenseIds, incomeIds, savingsIds, transactions]);

  const totalAmount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-left pb-0">
        <CardTitle>Distribuzione entrate</CardTitle>
        <CardDescription>
          Ripartizione delle entrate per destinazione
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig]?.label ||
                        name}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums">
                        {formatAmount({
                          amount: parseFloat(value.toString()),
                        })}
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatAmount({
                            amount: totalAmount,
                            maximumFractionDigits: 0,
                          })}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Entrate
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            {/* <ChartLegend
              content={<ChartLegendContent nameKey="browser" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            /> */}
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
