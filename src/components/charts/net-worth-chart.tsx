import { cn } from "~/lib/utils";
import { formatAmount } from "~/shared/helpers/format";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis } from "recharts";

import type { ChartConfig } from "../ui/chart";
import type { BaseChartProps } from "./chart-utils";
import { ChartContainer } from "../ui/chart";
import { StyledTooltip } from "./base-charts";
import { useChartMargin } from "./chart-utils";

interface NetWorthData {
  date: string;
  value: number;
  currency: string;
}

interface NetWorthChartProps extends BaseChartProps {
  data: NetWorthData[];
  showLegend?: boolean;
}

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Custom formatter for runway tooltip
const netWorthTooltipFormatter = (value: number): [string, string] => {
  const formattedValue = formatAmount({
    amount: value,
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  const displayName = "Net worth";
  return [formattedValue, displayName];
};

export function NetWorthChart({
  data,
  height,
  className = "",
}: NetWorthChartProps) {
  // Calculate margin using the utility hook
  // const { marginLeft } = useChartMargin(data, "amount", tickFormatter);

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("w-full", className)}
      style={{ height }}
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ left: -8, right: -8, top: 12 }}
      >
        <CartesianGrid
          strokeOpacity="0"
          vertical={false}
          className="stoke-[#DCDAD2] dark:stroke-[#2C2C2C]"
        />

        {/* Needed to show tooltip title */}
        <XAxis dataKey="date" hide />

        <Tooltip
          content={<StyledTooltip formatter={netWorthTooltipFormatter} />}
          wrapperStyle={{ zIndex: 9999 }}
        />

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
  );
}
