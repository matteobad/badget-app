"use client";

import { useChatActions, useChatId } from "@ai-sdk-tools/store";
import { useChatInterface } from "~/hooks/use-chat-interface";
import { cn } from "~/lib/utils";
import { endOfMonth, subMonths } from "date-fns";
import {
  BarChartIcon,
  HeartPulseIcon,
  ReceiptEuroIcon,
  ShapesIcon,
  TagIcon,
} from "lucide-react";

import { Button } from "./ui/button";

export function SuggestedActions() {
  const { sendMessage } = useChatActions();
  const { setChatId } = useChatInterface();
  const chatId = useChatId();

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

  const SUGGESTED_ACTIONS = [
    {
      id: "revenue",
      title: "Revenue",
      icon: BarChartIcon,
      onClick: () => {
        handleToolCall({
          toolName: "getRevenue",
          toolParams: {
            from: subMonths(new Date(), 12).toISOString(),
            to: endOfMonth(new Date()).toISOString(),
            currency: "SEK",
            showCanvas: true,
          },
          text: "Get my revenue data",
        });
      },
    },
    {
      id: "burn-rate",
      title: "Burn rate",
      icon: HeartPulseIcon,
      onClick: () => {
        handleToolCall({
          toolName: "getBurnRate",
          toolParams: {
            showCanvas: true,
          },
          text: "Analyze my burn rate",
        });
      },
    },
    {
      id: "expenses",
      title: "Expenses",
      icon: TagIcon,
      onClick: () => {
        handleToolCall({
          toolName: "getExpenses",
          toolParams: {
            showCanvas: true,
          },
          text: "Get my expenses data",
        });
      },
    },
    {
      id: "new-task",
      title: "New task",
      icon: ShapesIcon,
      onClick: () => {
        handleToolCall({
          toolName: "newTask",
          toolParams: {},
          text: "New task",
        });
      },
    },
    {
      id: "health-report",
      title: "Health report",
      icon: HeartPulseIcon,
      onClick: () => {
        handleToolCall({
          toolName: "healthReport",
          toolParams: {},
          text: "Health report",
        });
      },
    },
    {
      id: "latest-transactions",
      title: "Latest transactions",
      icon: ReceiptEuroIcon,
      onClick: () => {
        handleToolCall({
          toolName: "getTransactions",
          toolParams: {
            pageSize: 10,
            sort: ["date", "desc"],
          },
          text: "Show me my latest transactions",
        });
      },
    },
  ];

  return (
    <div className="flex w-full items-center justify-center px-6 py-4">
      <div className="scrollbar-hide flex gap-3 overflow-x-auto">
        {SUGGESTED_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              type="button"
              variant="outline"
              className={cn(
                "flex min-w-fit items-center gap-3 px-4 py-3",
                "font-regular text-sm text-foreground",
                "whitespace-nowrap",
              )}
              onClick={action.onClick}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {action.title}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
