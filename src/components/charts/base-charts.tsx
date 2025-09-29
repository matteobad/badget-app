"use client";

import type * as React from "react";
import * as RechartsPrimitive from "recharts";

import { commonChartConfig } from "./chart-utils";

// Base Chart Wrapper with common styling
export function BaseChart({
  data,
  margin = { top: 5, right: 5, left: -20, bottom: 5 },
  children,
}: {
  data: any[];
  height?: number;
  margin?: { top: number; right: number; left: number; bottom: number };
  children: React.ReactNode;
  config?: any;
}) {
  return (
    <RechartsPrimitive.ComposedChart data={data} margin={margin}>
      <RechartsPrimitive.CartesianGrid
        strokeDasharray="3 3"
        stroke="#e6e6e6"
        className="dark:stroke-[#1d1d1d]"
      />
      {children}
    </RechartsPrimitive.ComposedChart>
  );
}

// Styled XAxis
export function StyledXAxis(props: any) {
  return (
    <RechartsPrimitive.XAxis
      axisLine={false}
      tickLine={false}
      tick={{ fill: "#666", fontSize: 10 }}
      {...props}
    />
  );
}

// Styled YAxis
export function StyledYAxis(props: any) {
  return (
    <RechartsPrimitive.YAxis
      axisLine={false}
      tickLine={false}
      tick={{ fill: "#666", fontSize: 10 }}
      {...props}
    />
  );
}

// Styled Area
export function StyledArea(props: any) {
  return (
    <RechartsPrimitive.Area
      type="monotone"
      strokeWidth={2}
      isAnimationActive={false}
      {...props}
    />
  );
}

// Styled Line
export function StyledLine(props: any) {
  return (
    <RechartsPrimitive.Line
      type="monotone"
      strokeWidth={2}
      dot={false}
      isAnimationActive={false}
      {...props}
    />
  );
}

// Styled Bar
export function StyledBar(props: any) {
  return <RechartsPrimitive.Bar {...props} />;
}

// Styled Tooltip
export function StyledTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any, name: string) => [string, string];
  // TODO: do better than this
  labelFormatter?: React.ComponentProps<
    typeof RechartsPrimitive.Tooltip
  >["labelFormatter"];
}) {
  if (active && payload && payload.length) {
    return (
      <div
        className="border border-gray-200 bg-white p-2 font-sans text-[10px] text-black dark:border-[#1d1d1d] dark:bg-[#0c0c0c] dark:text-white"
        style={{
          borderRadius: "0px",
          fontFamily: commonChartConfig.fontFamily,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p className="mb-1 text-gray-500 capitalize dark:text-[#666666]">
          {labelFormatter ? labelFormatter(label, payload) : label}
        </p>
        {payload.map((entry, index) => {
          const value = typeof entry.value === "number" ? entry.value : 0;
          const [formattedValue, name] = formatter
            ? formatter(value, entry.dataKey)
            : [`${value.toLocaleString()}`, entry.dataKey];

          return (
            <p
              key={`${entry.dataKey}-${index}`}
              className="flex w-full justify-between gap-4 text-black dark:text-white"
            >
              <span>{name}:</span>
              <span className="text-right font-mono tabular-nums">
                {formattedValue}
              </span>
            </p>
          );
        })}
      </div>
    );
  }

  return null;
}

// Chart Legend
export function ChartLegend({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    type: "solid" | "dashed" | "pattern";
    color?: string;
  }[];
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h4 className="font-serif text-[18px] font-normal text-black dark:text-white">
        {title}
      </h4>
      <div className="flex items-center gap-4">
        {items.map((item, index) => (
          <div
            key={`legend-${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            <div
              className="h-2 w-2"
              style={{
                background:
                  item.type === "solid"
                    ? item.color || "#000000"
                    : item.type === "pattern"
                      ? "repeating-linear-gradient(45deg, #666666, #666666 1px, transparent 1px, transparent 2px)"
                      : item.color || "#666666",
                borderRadius: "0",
              }}
            />
            <span className="text-[12px] text-gray-500 dark:text-[#666666]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
