"use client";

import { useQuery } from "@tanstack/react-query";
import { PiggyBankIcon } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useSpaceQuery } from "~/hooks/use-space";
import { useUserQuery } from "~/hooks/use-user";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { getWidgetPeriodDates } from "~/shared/helpers/widget-period";
import { useScopedI18n } from "~/shared/locales/client";

import { BaseWidget, WidgetSkeleton } from "./base";

export function SavingAnalysisWidget() {
  const tSavingAnalysis = useScopedI18n("widgets.saving-analysis");

  const trpc = useTRPC();
  const { data: space } = useSpaceQuery();
  const { data: user } = useUserQuery();

  const { from, to } = useMemo(() => {
    const period = "last_12_months";
    return getWidgetPeriodDates(period, 1, user?.weekStartsOnMonday ? 1 : 0);
  }, [user?.weekStartsOnMonday]);

  const { data, isLoading } = useQuery({
    ...trpc.widgets.getSavingAnalysis.queryOptions({
      from,
      to,
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const getDescription = () => {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[#666666]">
          {tSavingAnalysis("description", {
            count: 12,
          })}{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(averageSaving)}
          </span>
        </p>
      </div>
    );
  };

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
  const chartData = data?.result.result ?? [];

  // Calculate average profit
  const averageSaving = data?.result.summary.averageSavings ?? 0;

  if (isLoading) {
    return <WidgetSkeleton />;
  }

  return (
    <BaseWidget
      title={tSavingAnalysis("title")}
      icon={<PiggyBankIcon className="size-4" />}
      description={getDescription()}
      actions={data && tSavingAnalysis("action")}
      onClick={data && handleViewAnalysis}
    >
      <div className="flex flex-1 items-end gap-2">
        <div className="h-14 w-full pb-2 [&_svg]:cursor-pointer">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <ReferenceLine
                y={0}
                stroke="var(--border)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <Bar dataKey="value" maxBarSize={8} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </BaseWidget>
  );
}
