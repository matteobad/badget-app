"use client";

import { useQuery } from "@tanstack/react-query";
import { useSpaceQuery } from "~/hooks/use-space";
import { useUserQuery } from "~/hooks/use-user";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { PiggyBankIcon } from "lucide-react";
import {
  Bar,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { BaseWidget } from "./base";

export function SavingAnalysisWidget() {
  const tSavingAnalysis = useScopedI18n("widgets.saving-analysis");

  const trpc = useTRPC();
  const { data: space } = useSpaceQuery();
  const { data: user } = useUserQuery();

  // Default to last 12 months
  const months = 12;

  const getDateRange = (monthsAgo: number) => {
    const to = endOfMonth(new Date());
    const from = startOfMonth(subMonths(to, monthsAgo - 1));
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  };

  const dateRange = getDateRange(months);

  const { data } = useQuery({
    ...trpc.widgets.getSavingAnalysis.queryOptions({
      from: dateRange.from,
      to: dateRange.to,
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const handleViewAnalysis = () => {
    // TODO: Navigate to detailed profit analysis page
    console.log("View detailed profit analysis clicked");
  };

  const formatCurrency = (amount: number) => {
    return formatAmount({
      amount,
      currency: space?.baseCurrency ?? "EUR",
      locale: user?.locale,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Prepare data for chart
  const chartData = (data?.result.result ?? []).slice(-months);

  // Calculate average profit
  const averageSaving = data?.result.summary.averageSavings ?? 0;

  return (
    <BaseWidget
      title={tSavingAnalysis("title")}
      icon={<PiggyBankIcon className="size-4" />}
      description={
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[#666666]">
            {tSavingAnalysis("description", {
              count: months,
            })}{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(averageSaving)}
            </span>
          </p>

          {/* Chart */}
          {chartData.length > 0 ? (
            <div className="mt-3 h-11 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <XAxis dataKey="month" hide />
                  <YAxis hide />
                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <Bar
                    dataKey="saving"
                    maxBarSize={8}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-2 text-xs text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      }
      actions={tSavingAnalysis("action")}
      onClick={handleViewAnalysis}
    >
      <div />
    </BaseWidget>
  );
}
