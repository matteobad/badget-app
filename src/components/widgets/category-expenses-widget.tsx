"use client";

import { useMemo } from "react";
import { useChatActions, useChatId } from "@ai-sdk-tools/store";
import { useQuery } from "@tanstack/react-query";
import { useChatInterface } from "~/hooks/use-chat-interface";
import { useSpaceQuery } from "~/hooks/use-space";
import { useUserQuery } from "~/hooks/use-user";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatCompactAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { getWidgetPeriodDates } from "~/shared/helpers/widget-period";
import { useScopedI18n } from "~/shared/locales/client";
import { format } from "date-fns";
import { ShapesIcon } from "lucide-react";

import { BaseWidget } from "./base";
import { ConfigurableWidget } from "./configurable-widget";
import { useConfigurableWidget } from "./use-configurable-widget";
import { WidgetSettings } from "./widget-settings";

export function CategoryExpensesWidget() {
  const { sendMessage } = useChatActions();
  const { setChatId } = useChatInterface();

  const chatId = useChatId();

  const tScoped = useScopedI18n("widgets.category-expenses");
  const trpc = useTRPC();

  const { data: space } = useSpaceQuery();
  const { data: user } = useUserQuery();

  const { config, isConfiguring, setIsConfiguring, saveConfig } =
    useConfigurableWidget("category-expenses");

  const { from, to } = useMemo(() => {
    const period = config?.period ?? "this_month";
    return getWidgetPeriodDates(period, 1, user?.weekStartsOnMonday ? 1 : 0);
  }, [config?.period, user?.weekStartsOnMonday]);

  const { data } = useQuery({
    ...trpc.widgets.getCategoryExpenses.queryOptions({
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
      currency: space?.baseCurrency ?? "EUR",
      limit: 3,
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const categoryData = data?.result;
  const categories = categoryData?.result.categories ?? [];
  const maxAmount = categories[0]?.amount ?? 0;

  const hasCategories = categoryData && categories.length > 0;

  const handleClick = () => {
    if (!chatId || !data?.toolCall) return;

    setChatId(chatId);

    void sendMessage({
      role: "user",
      parts: [{ type: "text", text: "Category expenses breakdown" }],
      metadata: {
        toolCall: data?.toolCall,
      },
    });

    // router.push(
    //   `/transactions?categories=${categories.map((category) => category.slug).join(",")}&start=${from}&end=${to}`,
    // );
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
        description={
          hasCategories ? (
            <div className="flex w-full flex-col gap-2">
              {categories.map((category, index) => {
                const percentage =
                  maxAmount > 0 ? (category.amount / maxAmount) * 100 : 0;

                const barColor =
                  index === 0
                    ? "bg-primary"
                    : index === 1
                      ? "bg-[#A0A0A0]"
                      : "bg-[#606060]";

                return (
                  <div key={category.slug} className="flex items-center gap-3">
                    <span className="w-[110px] shrink-0 truncate text-xs text-[#878787]">
                      {category.name}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      <div
                        className="h-2 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      >
                        <div className={`h-full ${barColor}`} />
                      </div>
                      <span className="shrink-0 text-xs tabular-nums">
                        {formatCompactAmount(category.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {tScoped("description")}
            </p>
          )
        }
        icon={<ShapesIcon className="size-4" />}
        onConfigure={() => setIsConfiguring(true)}
        onClick={hasCategories ? handleClick : undefined}
        actions={hasCategories ? tScoped("action") : undefined}
      />
    </ConfigurableWidget>
  );
}
