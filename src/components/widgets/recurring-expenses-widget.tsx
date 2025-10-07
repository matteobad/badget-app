"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSpaceQuery } from "~/hooks/use-space";
import { useUserQuery } from "~/hooks/use-user";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { getWidgetPeriodDates } from "~/shared/helpers/widget-period";
import { useScopedI18n } from "~/shared/locales/client";
import { CalendarSyncIcon } from "lucide-react";

import { AnimatedNumber } from "../animated-number";
import { BaseWidget, WidgetSkeleton } from "./base";
import { ConfigurableWidget } from "./configurable-widget";
import { useConfigurableWidget } from "./use-configurable-widget";
import { WidgetSettings } from "./widget-settings";

export function RecurringExpensesWidget() {
  const tScoped = useScopedI18n("widgets.recurring-expenses");
  // const tWidgetSettings = useScopedI18n("widgets.settings");

  const trpc = useTRPC();
  const router = useRouter();

  const { data: space } = useSpaceQuery();
  const { data: user } = useUserQuery();

  const { config, isConfiguring, setIsConfiguring, saveConfig, isUpdating } =
    useConfigurableWidget("recurring-expenses");

  const { from, to } = useMemo(() => {
    const period = config?.period ?? "last_12_months";
    return getWidgetPeriodDates(period, 1, user?.weekStartsOnMonday ? 1 : 0);
  }, [config?.period, user?.weekStartsOnMonday]);

  const { data, isLoading } = useQuery({
    ...trpc.widgets.getRecurringExpenses.queryOptions({
      from,
      to,
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const recurringData = data?.result;

  const getDescription = () => {
    if (!recurringData || recurringData?.summary?.totalExpensesCount === 0) {
      return tScoped("description_empty");
    }

    return (
      <div className="text-sm">
        <span className="text-muted-foreground">
          {tScoped("description.part_1")}
        </span>
        <span className="font-medium">
          {tScoped("description.part_2", {
            count: recurringData?.summary?.totalExpensesCount ?? 0,
          })}
        </span>
        <span className="text-muted-foreground">
          {tScoped("description.part_3")}
        </span>
        <span className="font-medium">
          {formatAmount({
            amount: recurringData?.summary?.totalExpensesAmount ?? 0,
            currency:
              recurringData?.summary.currency ?? space?.baseCurrency ?? "EUR",
            locale: user?.locale,
          })}
        </span>
      </div>
    );
  };

  const handleClick = () => {
    router.push(`/transactions?recurring=all`);
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
        />
      }
    >
      <BaseWidget
        title={tScoped("title")}
        icon={<CalendarSyncIcon className="size-4" />}
        description={data && getDescription()}
        onClick={data && handleClick}
        actions={data && tScoped("action")}
      >
        <div className="flex flex-1 items-end gap-2">
          <div className="flex w-full items-baseline">
            <span className="text-2xl">
              {recurringData && (
                <AnimatedNumber
                  animated={false}
                  value={recurringData?.summary.totalMonthlyEquivalent ?? 0}
                  currency={
                    recurringData?.summary.currency ??
                    space?.baseCurrency ??
                    "EUR"
                  }
                />
              )}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              /{tScoped("month")}
            </span>
          </div>
        </div>
      </BaseWidget>
    </ConfigurableWidget>
  );
}
