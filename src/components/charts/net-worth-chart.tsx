import { cn } from "~/lib/utils";
import { formatAmount } from "~/shared/helpers/format";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartConfig } from "../ui/chart";
import type { BaseChartProps } from "./chart-utils";
import { ChartContainer } from "../ui/chart";
import { StyledTooltip } from "./base-charts";
import { createCompactTickFormatter, useChartMargin } from "./chart-utils";

interface NetWorthData {
  date: string;
  amount: number;
  average: number;
}

interface NetWorthChartProps extends BaseChartProps {
  data: NetWorthData[];
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  currency?: string;
  locale?: string;
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
  currency = "USD",
  locale,
}: any) => {
  if (active && Array.isArray(payload) && payload.length > 0) {
    const current = payload[0]?.value;
    const average = payload[1]?.value;

    // Format amounts using proper currency formatting
    const formatCurrency = (amount: number) =>
      formatAmount({
        amount,
        currency,
        locale: locale ?? undefined,
        maximumFractionDigits: 0,
      }) ?? `${currency}${amount.toLocaleString()}`;

    return (
      <div className="font-hedvig-sans border border-[#e6e6e6] bg-white p-2 text-[10px] text-black shadow-sm dark:border-[#1d1d1d] dark:bg-[#0c0c0c] dark:text-white">
        <p className="mb-1 text-[#707070] dark:text-[#666666]">{label}</p>
        {typeof current === "number" && (
          <p className="text-black dark:text-white">
            Current: {formatCurrency(current)}
          </p>
        )}
        {typeof average === "number" && (
          <p className="text-black dark:text-white">
            Average: {formatCurrency(average)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function NetWorthChart({
  data,
  height = 260,
  currency = "EUR",
  locale,
  showXAxis,
  showYAxis,
  className = "",
}: NetWorthChartProps) {
  // Use the compact tick formatter
  const tickFormatter = createCompactTickFormatter();

  // Calculate margin using the utility hook
  const { marginLeft } = useChartMargin(data, "amount", tickFormatter);

  return (
    <div className="w-full">
      {/* Chart */}
      <div style={{ height }} className={cn(className)}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            accessibilityLayer
            data={data}
            margin={{ top: 2, right: 6, left: -marginLeft, bottom: 0 }}
          >
            <defs>
              <pattern
                id="netWorthPattern"
                x="0"
                y="0"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  width="8"
                  height="8"
                  fill="white"
                  className="dark:fill-[#0c0c0c]"
                />
                <path
                  d="M0,0 L8,8 M-2,6 L6,16 M-4,4 L4,12"
                  stroke="#707070"
                  className="dark:stroke-[#666666]"
                  strokeWidth="0.8"
                  opacity="0.6"
                />
              </pattern>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor="#707070"
                  className="dark:[stop-color:#666666]"
                />
                <stop
                  offset="100%"
                  stopColor="#000000"
                  className="dark:[stop-color:#ffffff]"
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeOpacity="0"
              vertical={false}
              className="stoke-[#DCDAD2] dark:stroke-[#2C2C2C]"
            />

            {/* Needed to show tooltip title */}
            <XAxis
              hide={!showXAxis}
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#707070",
                fontSize: 10,
                fontFamily: "Hedvig Letters Sans",
                className: "dark:fill-[#666666]",
              }}
            />
            <YAxis
              hide={!showYAxis}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#707070",
                fontSize: 10,
                fontFamily: "Hedvig Letters Sans",
                className: "dark:fill-[#666666]",
              }}
              tickFormatter={tickFormatter}
              dataKey="amount"
            />

            <Tooltip
              content={<CustomTooltip currency={currency} locale={locale} />}
              wrapperStyle={{ zIndex: 9999 }}
            />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="url(#lineGradient)"
              strokeWidth={2}
              fill="url(#netWorthPattern)"
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#707070"
              className="dark:stroke-[#666666]"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
