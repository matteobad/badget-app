import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSpaceQuery } from "~/hooks/use-space";
import { useUserQuery } from "~/hooks/use-user";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { getWidgetPeriodDates } from "~/shared/helpers/widget-period";
import { useScopedI18n } from "~/shared/locales/client";
import { format } from "date-fns";
import { ScaleIcon } from "lucide-react";

import { BaseWidget } from "./base";
import { ConfigurableWidget } from "./configurable-widget";
import { useConfigurableWidget } from "./use-configurable-widget";
import { WidgetSettings } from "./widget-settings";

export function CashFlowWidget() {
  const tWidgetSettings = useScopedI18n("widgets.settings");
  const tCashFlow = useScopedI18n("widgets.cash-flow");

  const trpc = useTRPC();

  const { data: space } = useSpaceQuery();
  const { data: user } = useUserQuery();

  const { config, isConfiguring, setIsConfiguring, saveConfig } =
    useConfigurableWidget("cash-flow");

  const { from, to } = useMemo(() => {
    const period = config?.period ?? "this_month";
    return getWidgetPeriodDates(period, 1, user?.weekStartsOnMonday ? 1 : 0);
  }, [config?.period, user?.weekStartsOnMonday]);

  const { data } = useQuery({
    ...trpc.widgets.getCashFlow.queryOptions({
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
      currency: space?.baseCurrency ?? "EUR",
      period: "monthly",
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
    // TODO: Navigate to cash flow analysis page
    console.log("View cash flow analysis clicked");
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
                count: data?.result.netCashFlow ?? 0,
              })}
            </p>
          </div>
        }
        actions={tCashFlow("action")}
        onClick={handleClick}
        onConfigure={() => setIsConfiguring(true)}
      >
        <div className="flex flex-1 items-end gap-2">
          <h2 className="text-2xl font-normal">
            {data &&
              formatCashFlow(
                data.result.netCashFlow ?? 0,
                data.result.currency,
              )}
          </h2>
        </div>
      </BaseWidget>
    </ConfigurableWidget>
  );
}
