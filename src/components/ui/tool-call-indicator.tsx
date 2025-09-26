"use client";

import { cn } from "~/lib/utils";
import { SearchIcon, TrendingUpIcon } from "lucide-react";

import { TextShimmer } from "./text-shimmer";

export const toolDisplayConfig = {
  getBurnRate: {
    displayText: "Getting Burn Rate Data",
    icon: TrendingUpIcon,
  },
  web_search: {
    displayText: "Searching the Web",
    icon: SearchIcon,
  },
} as const;

export type SupportedToolName = keyof typeof toolDisplayConfig;

export interface ToolCallIndicatorProps {
  toolName: SupportedToolName;
  className?: string;
}

export function ToolCallIndicator({
  toolName,
  className,
}: ToolCallIndicatorProps) {
  const config = toolDisplayConfig[toolName];

  if (!config) {
    return null;
  }

  return (
    <div className={cn("animate-fade-in mt-3 flex justify-start", className)}>
      <div className="flex w-fit items-center gap-2 border px-3 py-1">
        <div className="flex size-3.5 items-center justify-center">
          <config.icon size={14} />
        </div>
        <TextShimmer className="text-xs text-[#707070]" duration={1}>
          {config.displayText}
        </TextShimmer>
      </div>
    </div>
  );
}
