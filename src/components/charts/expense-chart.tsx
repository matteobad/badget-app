"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useMetricsParams } from "~/hooks/use-metrics-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { InfoIcon } from "lucide-react";

import { AnimatedNumber } from "../animated-number";
import { expenseChartExampleData } from "./data";
import { StackedBarChart } from "./stacked-bar-chart";

type Props = {
  disabled?: boolean;
};

export function ExpenseChart({ disabled }: Props) {
  const trpc = useTRPC();
  const { params } = useMetricsParams();

  const { data } = useQuery({
    ...trpc.metrics.expense.queryOptions({
      from: params.from,
      to: params.to,
      currency: params.currency ?? undefined,
    }),
    placeholderData: (previousData) => previousData ?? expenseChartExampleData,
  });

  return (
    <div
      className={cn(
        disabled && "pointer-events-none opacity-20 blur-[8px] select-none",
      )}
    >
      <div className="mb-14 inline-block space-y-2 select-text">
        <h1 className="font-mono text-4xl">
          <AnimatedNumber
            value={data?.summary?.averageExpense ?? 0}
            currency={data?.summary?.currency ?? "EUR"}
          />
        </h1>

        <div className="flex items-center space-x-2 text-sm">
          <p className="text-sm">Average expenses</p>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="mt-1 h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent
                className="max-w-[240px] p-4 text-xs"
                side="bottom"
                sideOffset={10}
              >
                <div className="space-y-2">
                  <h3 className="font-medium">Expenses Overview</h3>
                  <p>
                    Expenses include all outgoing transactions, including
                    recurring ones. The chart shows total expenses and recurring
                    costs, helping you identify spending patterns and fixed
                    costs.
                  </p>
                  <p>
                    All amounts are converted into your{" "}
                    <Link href="/settings/accounts" className="underline">
                      base currency
                    </Link>
                    .
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {data && <StackedBarChart data={data} />}
    </div>
  );
}
