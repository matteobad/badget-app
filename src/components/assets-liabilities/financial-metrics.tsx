"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useMetricsParams } from "~/hooks/use-metrics-params";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { InfoIcon } from "lucide-react";

import { AnimatedNumber } from "../animated-number";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type FinancialMetricType = "netWorth" | "assets" | "liabilities";
const FINANCIAL_METRIC: FinancialMetricType[] = [
  "netWorth",
  "assets",
  "liabilities",
] as const;

export function FinancialMetrics() {
  const { params } = useMetricsParams();

  const trpc = useTRPC();

  const { data } = useQuery(
    trpc.metrics.financialMetrics.queryOptions({
      from: params.from,
      to: params.to,
    }),
  );

  // const { data: accounts, isLoading } = useQuery(trpc.asset.get.queryOptions());

  return (
    <div className="grid gap-6 p-6 pb-4 lg:grid-cols-3">
      {FINANCIAL_METRIC.map((accountType) => {
        return (
          <div
            className="mb-2 space-y-3 border p-6 select-text"
            key={accountType}
          >
            <h1 className="font-mono text-4xl">
              <AnimatedNumber
                value={data?.summary[accountType] ?? 0}
                currency={data?.summary.currency ?? "EUR"}
              />
            </h1>
            <div className="flex items-center space-x-2">
              <p>{accountType}</p>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent
                    className="max-w-[240px] space-y-2 p-4 text-xs"
                    side="bottom"
                    sideOffset={10}
                  >
                    <h3 className="font-medium">
                      Net worth is the total value of all your assets minus your
                      liabilities.
                    </h3>
                    <p>
                      This chart shows how your net worth changes over time,
                      helping you track your overall financial progress. Your
                      net worth increases as you save, invest, or pay down
                      debts, and decreases if your expenses or debts grow. If
                      it&apos;s incorrect, internal transfers may be counted as
                      income. You can adjust this by excluding the transactions
                      from the calculations.
                    </p>

                    <p>
                      All amounts are shown in your{" "}
                      <Link href="/settings/accounts" className="underline">
                        base currency
                      </Link>
                      .
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">2 accounts</p>
          </div>
        );
      })}
    </div>
  );
}
