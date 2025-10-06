"use client";

import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

import { SkeletonChart } from "./skeleton";

interface CanvasChartProps {
  title: string;
  children: ReactNode;
  legend?: {
    items: Array<{
      label: string;
      type: "solid" | "dashed" | "pattern";
      color?: string;
    }>;
  };
  isLoading?: boolean;
  height?: string | number;
  className?: string;
}

export function CanvasChart({
  title,
  children,
  legend,
  isLoading = false,
  height = "20rem",
  className,
}: CanvasChartProps) {
  if (isLoading) {
    return (
      <div className={cn("mb-6", className)}>
        <SkeletonChart height={height} />
      </div>
    );
  }

  return (
    <div className={cn("mb-6", className)}>
      {/* Chart Header */}
      <div className="mb-4 flex items-center justify-between gap-8">
        <h4 className="font-serif text-[18px] font-normal whitespace-nowrap text-black dark:text-white">
          {title}
        </h4>
        {legend && (
          <div
            className="flex h-7 items-center gap-4 overflow-x-auto"
            data-hide-in-pdf="true"
          >
            {legend.items.map((item, index) => {
              const getSquareClasses = (type: string, color?: string) => {
                const baseColor = color ?? "#707070";

                switch (type) {
                  case "solid":
                    return "w-2 h-2 flex-shrink-0 bg-primary";
                  case "dashed":
                    return `w-2 h-2 flex-shrink-0 bg-transparent border border-dashed border-[${baseColor}]`;
                  case "pattern":
                    return "w-2 h-2 flex-shrink-0 bg-transparent";
                  default:
                    return `w-2 h-2 flex-shrink-0 bg-[${baseColor}]`;
                }
              };

              const getSquareStyle = (type: string, color?: string) => {
                const baseColor = color ?? "#707070";

                switch (type) {
                  case "pattern":
                    return {
                      backgroundImage: `repeating-linear-gradient(45deg, ${baseColor}, ${baseColor} 1px, transparent 1px, transparent 2px)`,
                    };
                  default:
                    return {};
                }
              };

              return (
                <div
                  key={`legend-${item.label}-${index}`}
                  className="flex items-center gap-2"
                >
                  <div
                    className={getSquareClasses(item.type, item.color)}
                    style={getSquareStyle(item.type, item.color)}
                  />
                  <span className="text-xs leading-none whitespace-nowrap text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div style={{ height }}>{children}</div>
    </div>
  );
}
