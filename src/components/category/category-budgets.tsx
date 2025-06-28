"use client";

import CreateBudgetForm from "../budget/create-budget-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

// const data = [
//   { month: "January", budget: 100, actual: 90 },
//   { month: "February", budget: 100, actual: 120 },
//   { month: "March", budget: 150, actual: 130 },
//   { month: "April", budget: 150, actual: 140 },
//   { month: "May", budget: 150, actual: 100 },
//   { month: "June", budget: 100, actual: 100 },
// ];

// const chartConfig = {
//   budget: {
//     label: "Budget",
//     color: "var(--chart-1)",
//   },
//   actual: {
//     label: "Actual",
//     color: "var(--primary)",
//   },
// } satisfies ChartConfig;

export function CategoryBudgets() {
  // const trpc = useTRPC();

  // const { data: items } = useSuspenseQuery(
  //   trpc.category.getFlatTree.queryOptions({
  //     categoryFilters,
  //     budgetFilters,
  //   }),
  // );

  return (
    <div className="flex h-full flex-1 flex-col gap-2">
      <Card className="p flex h-full flex-col gap-4 rounded-none border-0">
        <CardHeader>
          <CardDescription>Budget per Food</CardDescription>
          <CardTitle className="text-3xl">€ 500</CardTitle>
          <CardDescription>+20.1% from last month</CardDescription>
        </CardHeader>
        <CardContent className="flex h-full flex-1 flex-col gap-8 p-0">
          <CreateBudgetForm className="px-4" />
          {/* <ChartContainer config={chartConfig} className="size-full">
            <AreaChart
              data={data}
              margin={{
                left: 0,
                right: 0,
              }}
            >
              <Area
                dataKey="actual"
                fill="var(--color-actual)"
                fillOpacity={0.05}
                stroke="var(--color-actual)"
                strokeWidth={2}
                type="step"
              />
            </AreaChart>
          </ChartContainer> */}
        </CardContent>
      </Card>
    </div>
  );
}
