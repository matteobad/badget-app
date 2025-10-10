"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { TrendingUpDownIcon } from "lucide-react";
import { useMemo } from "react";
import {
  Line,
  LineChart,
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
import { ConfigurableWidget } from "./configurable-widget";
import { useConfigurableWidget } from "./use-configurable-widget";
import { WidgetSettings } from "./widget-settings";

export function IncomeForecastWidget() {
  const tForecast = useScopedI18n("widgets.income-forecast");

  const trpc = useTRPC();

  const { data: space } = useSpaceQuery();
  const { data: user } = useUserQuery();

  const { config, isConfiguring, setIsConfiguring, saveConfig, isUpdating } =
    useConfigurableWidget("income-forecast");

  const { from, to } = useMemo(() => {
    const period = config?.period ?? "last_12_months";
    return getWidgetPeriodDates(period, 1, user?.weekStartsOnMonday ? 1 : 0);
  }, [config?.period, user?.weekStartsOnMonday]);

  const { data, isLoading } = useQuery({
    ...trpc.widgets.getIncomeForecast.queryOptions({
      from,
      to,
      forecastMonths: 6, // TODO: configure this config?.forecastMonths ?? 6,
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const getDescription = () => {
    if (!data || data.result.summary.nextMonthProjection === 0) {
      return tForecast("description_empty");
    }

    const projection = formatAmount({
      amount: data.result.summary.nextMonthProjection,
      currency: data.result.summary.currency,
    });

    return (
      <div className="text-sm text-muted-foreground">
        <span>{tForecast("description")} </span>
        <span className="font-medium text-primary">{projection}</span>
      </div>
    );
  };

  const handleViewDetails = () => {
    // TODO: Navigate to detailed forecast page
    console.log("View forecast details clicked");
  };

  // Prepare data for simple trend line chart
  // Show last 6 months of actual + all forecast months for better context
  const chartData = data?.result.combined
    ? [
        // Last 6 actual months
        ...data.result.historical.slice(-6).map((item) => ({
          month: format(new Date(item.date), "MMM"),
          value: item.value,
          type: "actual",
        })),
        // All forecast months
        ...data.result.forecast.map((item) => ({
          month: format(new Date(item.date), "MMM"),
          value: item.value,
          type: "forecast",
        })),
      ]
    : [];

  if (isLoading || isUpdating) {
    return <WidgetSkeleton />;
  }

  return (
    <ConfigurableWidget
      isConfiguring={isConfiguring}
      settings={
        <WidgetSettings
          config={config}
          onSave={saveConfig}
          onCancel={() => setIsConfiguring(false)}
          showPeriod
          showRevenueType={false}
        />
      }
    >
      <BaseWidget
        title={tForecast("title")}
        icon={<TrendingUpDownIcon className="size-4" />}
        description={getDescription()}
        actions={data && tForecast("action")}
        onClick={data && handleViewDetails}
      >
        <div className="flex flex-1 items-end gap-2">
          {/* Simple trend line chart */}
          {!isLoading && chartData.length > 0 ? (
            <div className="h-14 w-full pb-2 [&_svg]:cursor-pointer">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 1 }}
                >
                  <XAxis dataKey="month" hide />
                  <YAxis hide />

                  {/* Reference line at zero */}
                  <ReferenceLine
                    y={0}
                    stroke="var(--border)"
                    strokeDasharray="2 2"
                  />

                  {/* Reference line at present */}
                  <ReferenceLine
                    x={format(new Date(), "MMM")}
                    stroke="var(--border)"
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--foreground)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="prediction"
                    stroke="var(--foreground)"
                    strokeWidth={2}
                    strokeDasharray="2 2"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-12 w-full items-center">
              <div className="text-xs text-muted-foreground">
                No data available
              </div>
            </div>
          )}
        </div>
      </BaseWidget>
    </ConfigurableWidget>
  );
}
