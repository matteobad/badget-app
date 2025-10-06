"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { BaseChartProps } from "./chart-utils";
import {
  BaseChart,
  ChartLegend,
  StyledBar,
  StyledTooltip,
  StyledXAxis,
  StyledYAxis,
} from "./base-charts";

interface ExpenseData {
  month: string;
  amount: number;
  category: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface ExpensesChartProps extends BaseChartProps {
  data: ExpenseData[];
  categoryData?: CategoryData[];
  chartType?: "bar" | "pie";
  showLegend?: boolean;
}

// Custom formatter for expenses tooltip
const expensesTooltipFormatter = (
  value: number,
  name: string,
): [string, string] => {
  const formattedValue = `$${value.toLocaleString()}`;
  const displayName = name === "amount" ? "Expenses" : name;
  return [formattedValue, displayName];
};

// Custom pie chart tooltip
const pieTooltipFormatter = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="border border-gray-200 bg-white p-2 text-xs text-black dark:border-[#1d1d1d] dark:bg-[#0c0c0c] dark:text-white">
        <p className="mb-1 text-gray-500 dark:text-[#666666]">
          {data.payload.name}
        </p>
        <p>${data.value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function ExpensesChart({
  data,
  categoryData,
  height = 320,
  className = "",
  chartType = "bar",
  showLegend = true,
}: ExpensesChartProps) {
  if (chartType === "pie" && categoryData) {
    return (
      <div className={`w-full ${className}`}>
        {/* Legend */}
        {showLegend && (
          <ChartLegend
            title="Expenses by Category"
            items={categoryData.map((item) => ({
              label: item.name,
              type: "solid" as const,
              color: item.color,
            }))}
          />
        )}

        {/* Pie Chart */}
        <div className="relative" style={{ height }}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            className="bg-[radial-gradient(circle,#00000015_1px,transparent_1px)] bg-[size:12px_12px] bg-repeat"
          >
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                fill="hsl(var(--foreground))"
                dataKey="value"
                innerRadius={60}
              >
                {categoryData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={pieTooltipFormatter} />
              {/* <Legend /> */}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Legend */}
      {showLegend && (
        <ChartLegend
          title="Monthly Expenses"
          items={[{ label: "Expenses", type: "solid" }]}
        />
      )}

      {/* Bar Chart */}
      <BaseChart data={data} height={height}>
        <StyledXAxis dataKey="month" />
        <StyledYAxis
          tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
        />

        <Tooltip
          content={<StyledTooltip formatter={expensesTooltipFormatter} />}
          wrapperStyle={{ zIndex: 9999 }}
        />

        <StyledBar dataKey="amount" usePattern />
      </BaseChart>
    </div>
  );
}
