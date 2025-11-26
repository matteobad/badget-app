"use client";

import { useChatActions, useChatId } from "@ai-sdk-tools/store";
import { useQuery } from "@tanstack/react-query";
import { LineChartIcon } from "lucide-react";
import { useMemo } from "react";
import { NetWorthChart } from "~/components/charts/net-worth-chart";
import { useChatInterface } from "~/hooks/use-chat-interface";
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

export function NetWorthWidget() {
  const { sendMessage } = useChatActions();
  const { setChatId } = useChatInterface();

  const chatId = useChatId();

  const tNetWorth = useScopedI18n("widgets.net-worth");
  const tSettings = useScopedI18n("widgets.settings");

  const trpc = useTRPC();

  const { data: space } = useSpaceQuery();
  const { data: user } = useUserQuery();

  const { config, isConfiguring, setIsConfiguring, saveConfig, isUpdating } =
    useConfigurableWidget("net-worth");

  const { from, to } = useMemo(() => {
    const period = config?.period ?? "last_3_months";
    return getWidgetPeriodDates(period, 1, user?.weekStartsOnMonday ? 1 : 0);
  }, [config?.period, user?.weekStartsOnMonday]);

  const { data, isLoading } = useQuery({
    ...trpc.widgets.getNetWorth.queryOptions({
      from,
      to,
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const netWorthData = data?.result;

  const getTitle = () => {
    const periodLabel = tSettings(
      `widget_period.${config?.period ?? "this_month"}`,
    );
    return `${tNetWorth("title")} ${periodLabel}`;
  };

  const getDescription = () => {
    const value = formatAmount({
      amount: netWorthData?.summary.netWorth ?? 0,
      currency: "EUR",
      maximumFractionDigits: 0,
    });
    const percentage =
      typeof netWorthData?.summary.deltaNetWorth === "number"
        ? `${new Intl.NumberFormat(undefined, {
            signDisplay: "always",
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          }).format(netWorthData.summary.deltaNetWorth)}%`
        : undefined;

    return (
      <div
        className="text-sm [&>b]:font-medium"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for bold text
        dangerouslySetInnerHTML={{
          __html: tNetWorth("description", {
            value,
            percentage,
          }),
        }}
      />
    );
  };

  const handleViewAnalysis = () => {
    if (!chatId || !data?.toolCall) return;

    setChatId(chatId);

    void sendMessage({
      role: "user",
      parts: [{ type: "text", text: "Analyze my net worth" }],
      metadata: {
        toolCall: data?.toolCall,
      },
    });
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
        icon={<LineChartIcon className="size-4 text-muted-foreground" />}
        description={getDescription()}
        actions={data && tNetWorth("action")}
        onClick={data && handleViewAnalysis}
        onConfigure={() => setIsConfiguring(true)}
      >
        <div className="flex flex-1 items-end gap-2">
          <NetWorthChart
            className="pb-2 [&_svg]:cursor-pointer"
            data={netWorthData?.result ?? []}
            height={56}
            showAnimation={false}
            showLegend={false}
            showXAxis={false}
            showYAxis={false}
          />
        </div>
      </BaseWidget>
    </ConfigurableWidget>
  );
}
