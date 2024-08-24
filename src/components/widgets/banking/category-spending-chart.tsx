"use client";

import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";

import type { ChartConfig } from "~/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { getSpendingByCategory } from "~/server/db/queries/cached-queries";

type Spendings = Awaited<ReturnType<typeof getSpendingByCategory>>;

const chartConfig = {
  actual: {
    label: "Actual",
    color: "rgb(15 23 42 / var(--tw-text-opacity))",
  },
  budget: {
    label: "Budget",
    color: "#cbd5e1",
  },
} satisfies ChartConfig;

export function CategorySpeningChart({ chartData }: { chartData: Spendings }) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] w-full text-slate-300"
    >
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          // tickFormatter={(value) => value.slice(0, 20)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
        <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
