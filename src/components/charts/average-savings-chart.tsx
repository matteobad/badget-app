import { cn } from "~/lib/utils";
import { formatAmount } from "~/shared/helpers/format";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis } from "recharts";

import type { ChartConfig } from "../ui/chart";
import type { BaseChartProps } from "./chart-utils";
import { ChartContainer } from "../ui/chart";
import { StyledTooltip } from "./base-charts";

interface AverageSavingsData {
  month: Date;
  income: number;
  expenses: number;
}

interface AverageSavingsChartProps extends BaseChartProps {
  data: AverageSavingsData[];
  showLegend?: boolean;
}

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

// Custom formatter for runway tooltip
const netAverageSavingsFormatter = (
  value: number,
  name: string,
): [string, string] => {
  const formattedValue = formatAmount({
    amount: value,
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  const displayName = name;
  return [formattedValue, displayName];
};

export function AverageSavingsChart({
  data,
  height,
  className = "",
}: AverageSavingsChartProps) {
  // Calculate margin using the utility hook
  // const { marginLeft } = useChartMargin(data, "amount", tickFormatter);

  const marginX = data.length === 12 ? 0 : -4;

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("w-full", className)}
      style={{ height }}
    >
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ left: marginX, right: marginX, top: 12 }}
      >
        <CartesianGrid
          strokeOpacity={0}
          vertical={false}
          className="stoke-[#DCDAD2] dark:stroke-[#2C2C2C]"
        />

        {/* Needed to show tooltip title */}
        <XAxis dataKey="month" hide />

        <Tooltip
          content={<StyledTooltip formatter={netAverageSavingsFormatter} />}
          labelFormatter={(label) => {
            if (!label) return "";
            const date = new Date(label); // funziona se label è timestamp (ms) o stringa ISO
            return date.toLocaleDateString("it-IT", {
              month: "short",
            });
          }}
          wrapperStyle={{ zIndex: 9999 }}
        />

        <Bar dataKey="income" fill="var(--color-income)" />
        <Bar dataKey="expenses" fill="var(--color-expenses)" />
      </BarChart>
    </ChartContainer>
  );
}
