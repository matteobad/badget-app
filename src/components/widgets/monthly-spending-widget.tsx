"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { getWidgetPeriodDates } from "~/shared/helpers/widget-period";
import { useScopedI18n } from "~/shared/locales/client";
import { format } from "date-fns";
import { TrendingDownIcon } from "lucide-react";

import { FormatAmount } from "../format-amount";
import { BaseWidget } from "./base";
import { ConfigurableWidget } from "./configurable-widget";
import { useConfigurableWidget } from "./use-configurable-widget";
import { WidgetSettings } from "./widget-settings";

export function MonthlySpendingWidget() {
  const tScoped = useScopedI18n("widgets.monthly-spending");

  const trpc = useTRPC();
  const router = useRouter();

  const { data: space } = useSpaceQuery();
  const { config, isConfiguring, setIsConfiguring, saveConfig } =
    useConfigurableWidget("monthly-spending");

  const { from, to } = useMemo(() => {
    const period = config?.period ?? "current_month";
    return getWidgetPeriodDates(period, 1);
  }, [config?.period]);

  const { data } = useQuery({
    ...trpc.widgets.getMonthlyExpenses.queryOptions({
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const spending = data?.result;

  const getDescription = () => {
    if (!spending || spending.totalSpending === 0) {
      return tScoped("description_empty");
    }

    if (spending.topCategory) {
      const topCategory = spending.topCategory.name;
      const percentage = spending.topCategory.percentage.toFixed(0);
      return tScoped("description", { category: topCategory, percentage });
    }

    return tScoped("description_default");
  };

  const handleClick = () => {
    router.push("/transactions?type=expense");
  };

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
        title={tScoped("title")}
        icon={<TrendingDownIcon className="size-4" />}
        description={getDescription()}
        onConfigure={() => setIsConfiguring(true)}
        onClick={handleClick}
        actions={tScoped("action")}
      >
        <div className="flex flex-1 items-end gap-2">
          {spending && spending.totalSpending > 0 && (
            <p className="text-2xl">
              <FormatAmount
                amount={spending.totalSpending}
                currency={spending.currency}
              />
            </p>
          )}
        </div>
      </BaseWidget>
    </ConfigurableWidget>
  );
}
