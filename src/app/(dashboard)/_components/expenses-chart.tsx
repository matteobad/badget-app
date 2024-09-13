"use client";

import {
  Bar,
  BarChart,
  Label,
  Rectangle,
  ReferenceLine,
  XAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { euroFormat } from "~/lib/utils";
import { type GetFilteredExpensesReturnType } from "~/server/db/queries/cached-queries";

export default function ExensesChart({
  expenses,
}: {
  expenses: GetFilteredExpensesReturnType;
}) {
  const totalAmount = expenses.reduce((a, b) => a + b.amount, 0);
  const averageAmount = totalAmount / expenses.length;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-0 pb-2">
        <CardDescription>Totale spese</CardDescription>
        <CardTitle className="text-4xl tabular-nums">
          {euroFormat(totalAmount.toString())}{" "}
          <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
            del mese
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[300px] w-full"
          config={{
            steps: {
              label: "€",
              color: "hsl(var(--chart-1))",
            },
          }}
        >
          <BarChart
            accessibilityLayer
            margin={{
              left: -4,
              right: -4,
            }}
            data={expenses}
          >
            <Bar
              dataKey="amount"
              fill="var(--color-amount)"
              radius={5}
              fillOpacity={0.6}
              activeBar={<Rectangle fillOpacity={0.8} />}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              defaultIndex={2}
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                  }}
                />
              }
              cursor={false}
            />
            <ReferenceLine
              y={averageAmount}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeWidth={1}
            >
              <Label
                position="insideBottomLeft"
                value={`Media giornaliera ${euroFormat(averageAmount.toString())}`}
                offset={10}
                fill="hsl(var(--foreground))"
              />
            </ReferenceLine>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <CardDescription>
          Negli ultimi 30 giorni hai speso{" "}
          <span className="font-medium text-foreground">
            {euroFormat(totalAmount.toString())}
          </span>{" "}
          .
        </CardDescription>
        <CardDescription>
          Ti restano <span className="font-medium text-foreground">12,584</span>{" "}
          euro nel tuo budget.
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
