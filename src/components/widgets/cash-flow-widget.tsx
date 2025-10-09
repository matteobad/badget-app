import { useQuery } from "@tanstack/react-query";
import { ScaleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
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

export function CashFlowWidget() {
  const tWidgetSettings = useScopedI18n("widgets.settings");
  const tCashFlow = useScopedI18n("widgets.cash-flow");

  const trpc = useTRPC();
  const router = useRouter();

  const { data: space } = useSpaceQuery();
  const { data: user } = useUserQuery();

  const { config, isConfiguring, setIsConfiguring, saveConfig, isUpdating } =
    useConfigurableWidget("cash-flow");

  const { from, to } = useMemo(() => {
    const period = config?.period ?? "this_month";
    return getWidgetPeriodDates(period, 1, user?.weekStartsOnMonday ? 1 : 0);
  }, [config?.period, user?.weekStartsOnMonday]);

  const { data, isLoading } = useQuery({
    ...trpc.widgets.getCashFlow.queryOptions({
      from,
      to,
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const getTitle = () => {
    const periodLabel = tWidgetSettings(
      `widget_period.${config?.period ?? "this_month"}`,
    );
    return `${tCashFlow("title")} ${periodLabel}`;
  };

  const handleClick = () => {
    router.push(`/transactions?reports=included&start=${from}&end=${to}`);
  };

  const formatCashFlow = (amount: number, currency: string) => {
    const sign = amount >= 0 ? "+" : "";
    const formatted = formatAmount({
      amount,
      currency,
      locale: user?.locale,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${sign}${formatted}`;
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
        icon={<ScaleIcon className="size-4" />}
        description={
          <div className="flex flex-col gap-1">
            <p className="text-sm text-[#666666]">
              {tCashFlow("description", {
                count: data?.result.count ?? 0,
              })}
            </p>
          </div>
        }
        actions={data && tCashFlow("action")}
        onClick={data && handleClick}
        onConfigure={() => setIsConfiguring(true)}
      >
        <div className="flex flex-1 items-end gap-2">
          <span className="text-2xl">
            {data &&
              formatCashFlow(
                data.result.netCashFlow ?? 0,
                data.result.currency,
              )}
          </span>
        </div>
      </BaseWidget>
    </ConfigurableWidget>
  );
}
