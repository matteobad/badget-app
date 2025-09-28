"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useChatActions, useChatId } from "@ai-sdk-tools/store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useChatInterface } from "~/hooks/use-chat-interface";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import {
  BanknoteArrowUpIcon,
  FlameIcon,
  ReceiptIcon,
  ShapesIcon,
} from "lucide-react";

import { Skeleton } from "./ui/skeleton";

type SuggestedAction =
  RouterOutput["suggestedActions"]["list"]["actions"][number];

export function SuggestedActionsSkeleton() {
  return (
    <div className="flex w-full items-center justify-center px-6 py-4">
      <div className="flex gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton
            key={`suggested-skeleton-${Date.now()}-${i}`}
            className="h-10 w-24"
          />
        ))}
      </div>
    </div>
  );
}

export function SuggestedActions() {
  const { sendMessage } = useChatActions();
  const { setChatId } = useChatInterface();
  const chatId = useChatId();
  const trpc = useTRPC();

  const { data: suggestedActionsData } = useSuspenseQuery(
    trpc.suggestedActions.list.queryOptions({
      limit: 6,
    }),
  );

  const handleToolCall = (params: {
    toolName: string;
    toolParams: Record<string, any>;
    text: string;
  }) => {
    if (!chatId) return;

    setChatId(chatId);

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: params.text }],
      metadata: {
        toolCall: {
          toolName: params.toolName,
          toolParams: params.toolParams,
        },
      },
    });
  };

  // UI configuration based on action ID
  const uiConfig: Record<
    string,
    {
      icon: React.ComponentType<any>;
      title: string;
      description: string;
    }
  > = {
    "get-burn-rate-analysis": {
      icon: FlameIcon,
      title: "Burn rate analysis",
      description: "Analyze my burn rate",
    },
    "latest-transactions": {
      icon: ReceiptIcon,
      title: "Latest transactions",
      description: "Show me my latest transactions",
    },
    "current-income": {
      icon: BanknoteArrowUpIcon,
      title: "Income",
      description: "Show me current month income",
    },
    "expenses-breakdown": {
      icon: ShapesIcon,
      title: "Expense Breakdown",
      description: "Show me my expense breakdown",
    },
  };

  const suggestedActions = suggestedActionsData.actions;

  return (
    <div className="flex w-full items-center justify-center px-6 py-4">
      <div className="scrollbar-hide flex gap-3 overflow-x-auto">
        {suggestedActions.map((action: SuggestedAction) => {
          const config = uiConfig[action.id];
          const Icon = config?.icon;
          const title = config?.title || action.id;
          const description =
            config?.description || `Execute ${action.toolName}`;

          return (
            <button
              key={action.id}
              type="button"
              className={cn(
                "border border-[#e6e6e6] dark:border-[#1d1d1d]",
                "hover:border-[#d0d0d0] hover:bg-[#f7f7f7]",
                "dark:hover:border-[#2a2a2a] dark:hover:bg-[#131313]",
                "flex cursor-pointer items-center gap-2 px-3 py-2",
                "min-w-fit whitespace-nowrap transition-all duration-300",
              )}
              onClick={() => {
                handleToolCall({
                  toolName: action.toolName,
                  toolParams: action.toolParams,
                  text: description,
                });
              }}
            >
              {Icon && (
                <Icon className="h-4 w-4 text-[#707070] dark:text-[#666666]" />
              )}
              <span className="text-[12px] font-medium text-black dark:text-white">
                {title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
