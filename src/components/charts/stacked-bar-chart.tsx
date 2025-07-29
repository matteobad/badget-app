"use client";

import type { getExpenses } from "~/server/services/metrics-service";
import { formatAmount } from "~/shared/helpers/format";
import { useScopedI18n } from "~/shared/locales/client";
import { format } from "date-fns";
import { DotIcon } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ToolTipContent = ({ payload = [] }: { payload: any[] }) => {
  const tScoped = useScopedI18n("chart_type");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const current = payload[0]?.payload;

  if (!current) return null;

  return (
    <div className="w-[240px] border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b-[1px] px-4 py-2">
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
        <p className="text-sm">{tScoped(current.meta.type)}</p>
      </div>

      <div className="p-4">
        <div className="mb-2 flex justify-between">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-[8px] w-[8px] rounded-full bg-[#C6C6C6] dark:bg-[#606060]" />
            <p className="text-[13px] font-medium">
              {formatAmount({
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                currency: current.currency,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                amount: current.total,
              })}
            </p>
          </div>

          <p className="text-right text-xs text-[#606060]">Total</p>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center justify-center space-x-2">
            <DotIcon />
            <p className="text-[13px] font-medium">
              {formatAmount({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                amount: current.recurring,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                currency: current.currency,
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              })}
            </p>
          </div>

          <p className="text-right text-xs text-[#606060]">Recurring</p>
        </div>
      </div>
    </div>
  );
};

export function StackedBarChart({
  data,
  height = 290,
}: {
  data: Awaited<ReturnType<typeof getExpenses>>;
  height?: number;
}) {
  const formattedData = data.result.map((item) => ({
    ...item,
    value: item.value,
    recurring: item.recurring,
    total: item.total,
    meta: data.meta,
    date: format(new Date(item.date), "MMM"),
  }));

  return (
    <div className="relative h-full w-full">
      <div className="absolute -top-10 right-0 hidden space-x-4 md:flex">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-[#C6C6C6] dark:bg-[#606060]" />
          <span className="text-sm text-[#606060]">Total expenses</span>
        </div>
        <div className="flex items-center space-x-2">
          <DotIcon />
          <span className="text-sm text-[#606060]">Recurring</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={formattedData} barGap={15}>
          <defs>
            <pattern
              id="raster"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              <rect
                width="64"
                height="64"
                className="fill-[#C6C6C6] dark:fill-[#323232]"
              />
              <path
                d="M-106 110L22 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-98 110L30 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-90 110L38 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-82 110L46 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-74 110L54 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-66 110L62 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-58 110L70 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-50 110L78 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-42 110L86 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-34 110L94 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-26 110L102 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-18 110L110 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-10 110L118 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M-2 110L126 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M6 110L134 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M14 110L142 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
              <path
                d="M22 110L150 -18"
                className="stroke-[#323232] dark:stroke-white"
              />
            </pattern>
          </defs>

          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={15}
            tick={{
              fill: "#606060",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
            }}
          />

          <YAxis
            stroke="#888888"
            fontSize={12}
            tickMargin={10}
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "#606060",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
            }}
          />

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stoke-[#DCDAD2] dark:stroke-[#2C2C2C]"
          />

          {/* @ts-expect-error bad types */}
          <Tooltip content={ToolTipContent} cursor={false} />

          <Bar
            barSize={16}
            dataKey="recurring"
            stackId="a"
            fill="url(#raster)"
          />

          <Bar
            barSize={16}
            dataKey="value"
            stackId="a"
            className="fill-[#C6C6C6] dark:fill-[#323232]"
          />

          <Line
            type="monotone"
            dataKey="recurring"
            strokeWidth={2.5}
            stroke="hsl(var(--border))"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
