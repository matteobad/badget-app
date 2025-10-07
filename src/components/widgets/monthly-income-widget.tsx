"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatedNumber } from "~/components/animated-number";
import { useSpaceQuery } from "~/hooks/use-space";
import { useUserQuery } from "~/hooks/use-user";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { getWidgetPeriodDates } from "~/shared/helpers/widget-period";
import { useScopedI18n } from "~/shared/locales/client";
import { TrendingUpIcon } from "lucide-react";

import { BaseWidget, WidgetSkeleton } from "./base";
import { ConfigurableWidget } from "./configurable-widget";
import { useConfigurableWidget } from "./use-configurable-widget";
import { WidgetSettings } from "./widget-settings";

export function MonthlyIncomeWidget() {
  const tIncome = useScopedI18n("widgets.income");
  const tWidgetSettings = useScopedI18n("widgets.settings");

  const trpc = useTRPC();
  const router = useRouter();

  const { data: space } = useSpaceQuery();
  const { data: user } = useUserQuery();

  const { config, isConfiguring, setIsConfiguring, saveConfig, isUpdating } =
    useConfigurableWidget("monthly-income");

  const { from, to } = useMemo(() => {
    const period = config?.period ?? "this_month";
    return getWidgetPeriodDates(period, 1, user?.weekStartsOnMonday ? 1 : 0);
  }, [config?.period, user?.weekStartsOnMonday]);

  const { data, isLoading } = useQuery({
    ...trpc.widgets.getMonthlyIncome.queryOptions({
      from,
      to,
      currency: space?.baseCurrency ?? "EUR",
      ...WIDGET_POLLING_CONFIG,
    }),
  });

  const income = data?.result;

  const getTitle = () => {
    const periodLabel = tWidgetSettings(
      `widget_period.${config?.period ?? "this_month"}`,
    );
    return `${tIncome("title")} ${periodLabel}`;
  };

  const getDescription = () => {
    if (!income || income.totalIncome === 0) {
      return tIncome("description_empty");
    }

    if (income.topCategory) {
      const topCategory = income.topCategory.name;
      const percentage = income.topCategory.percentage.toFixed(0);
      return tIncome("description", { category: topCategory, percentage });
    }

    return tIncome("description_default");
  };

  const handleClick = () => {
    router.push(`/transactions?type=income&start=${from}&end=${to}`);
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
        icon={<TrendingUpIcon className="size-4 text-muted-foreground" />}
        description={data && getDescription()}
        actions={data && tIncome("action")}
        onClick={data && handleClick}
        onConfigure={() => setIsConfiguring(true)}
      >
        <div className="flex flex-1 items-end gap-2">
          <span className="text-2xl">
            {income && (
              <AnimatedNumber
                animated={false}
                value={income?.totalIncome ?? 0}
                currency={income?.currency ?? space?.baseCurrency ?? "EUR"}
              />
            )}
          </span>
        </div>
      </BaseWidget>
    </ConfigurableWidget>
  );
}
