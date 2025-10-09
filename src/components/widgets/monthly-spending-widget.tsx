"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { TrendingDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useSpaceQuery } from "~/hooks/use-space";
import { useUserQuery } from "~/hooks/use-user";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { getWidgetPeriodDates } from "~/shared/helpers/widget-period";
import { useScopedI18n } from "~/shared/locales/client";

import { AnimatedNumber } from "../animated-number";
import { BaseWidget, WidgetSkeleton } from "./base";
import { ConfigurableWidget } from "./configurable-widget";
import { useConfigurableWidget } from "./use-configurable-widget";
import { WidgetSettings } from "./widget-settings";

export function MonthlySpendingWidget() {
  const tSpending = useScopedI18n("widgets.monthly-spending");
  const tWidgetSettings = useScopedI18n("widgets.settings");

  const trpc = useTRPC();
  const router = useRouter();

  const { data: space } = useSpaceQuery();
  const { data: user } = useUserQuery();

  const { config, isConfiguring, setIsConfiguring, saveConfig, isUpdating } =
    useConfigurableWidget("monthly-spending");

  const { from, to } = useMemo(() => {
    const period = config?.period ?? "this_month";
    return getWidgetPeriodDates(period, 1, user?.weekStartsOnMonday ? 1 : 0);
  }, [config?.period, user?.weekStartsOnMonday]);

  const { data, isLoading } = useQuery({
    ...trpc.widgets.getMonthlyExpenses.queryOptions({
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const spending = data?.result;

  const getTitle = () => {
    const periodLabel = tWidgetSettings(
      `widget_period.${config?.period ?? "this_month"}`,
    );
    return `${tSpending("title")} ${periodLabel}`;
  };

  const getDescription = () => {
    if (!spending || spending.totalSpending === 0) {
      return tSpending("description_empty");
    }

    if (spending.topCategory) {
      const topCategory = spending.topCategory.name;
      const percentage = spending.topCategory.percentage.toFixed(0);
      return tSpending("description", { category: topCategory, percentage });
    }

    return tSpending("description_default");
  };

  const handleClick = () => {
    router.push(`/transactions?type=expense&start=${from}&end=${to}`);
  };

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
        title={getTitle()}
        icon={<TrendingDownIcon className="size-4" />}
        description={data && getDescription()}
        onClick={data && handleClick}
        actions={data && tSpending("action")}
        onConfigure={() => setIsConfiguring(true)}
      >
        <div className="flex flex-1 items-end gap-2">
          <span className="text-2xl">
            {spending && (
              <AnimatedNumber
                animated={false}
                value={spending.totalSpending}
                currency={spending.currency}
              />
            )}
          </span>
        </div>
      </BaseWidget>
    </ConfigurableWidget>
  );
}
