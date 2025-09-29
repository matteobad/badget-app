"use client";

import { useQuery } from "@tanstack/react-query";
import { AverageSavingsChart } from "~/components/charts/average-savings-chart";
import { useSpaceQuery } from "~/hooks/use-space";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { formatISO, subMonths } from "date-fns";
import { BarChartIcon, PiggyBankIcon } from "lucide-react";

import {
  useWidget,
  Widget,
  WidgetAction,
  WidgetContent,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetSettings,
  WidgetSettingsTrigger,
  WidgetTitle,
} from "../widget";
import { SavingsWidgetSettings } from "./savings-widget-settings";

export function SavingsWidget() {
  const tSavings = useScopedI18n("widgets.savings");

  const { settings } = useWidget();

  const { data: space } = useSpaceQuery();
  const trpc = useTRPC();

  const { data: savingsData, isLoading } = useQuery(
    trpc.reports.getSavings.queryOptions({
      from:
        settings.from ??
        formatISO(subMonths(new Date(), 1), { representation: "date" }),
      to: settings.to ?? formatISO(new Date(), { representation: "date" }),
    }),
  );

  return (
    <Widget>
      <WidgetHeader>
        <WidgetTitle className="flex items-center gap-3">
          <PiggyBankIcon className="size-4 text-muted-foreground" />
          {tSavings("title")}
        </WidgetTitle>
        <WidgetDescription>
          <div className="text-sm">
            <span className="text-muted-foreground">
              {tSavings("description.part_1")}
            </span>
            <span className="font-medium text-primary">
              {tSavings("description.part_2", {
                value: formatAmount({
                  amount: savingsData?.summary?.savings ?? 0,
                  currency:
                    savingsData?.summary.currency ??
                    space?.baseCurrency ??
                    "EUR",
                  maximumFractionDigits: 0,
                }),
                count: savingsData?.result.length,
              })}
            </span>
          </div>
        </WidgetDescription>
        <WidgetSettingsTrigger />
      </WidgetHeader>

      {/* View mode */}
      <WidgetContent className="flex flex-col gap-2">
        <AverageSavingsChart
          data={savingsData?.result ?? []}
          height={60}
          showAnimation={true}
          showLegend={false}
        />
      </WidgetContent>

      {/* Edit mode */}
      <WidgetSettings>
        <SavingsWidgetSettings />
      </WidgetSettings>

      <WidgetFooter>
        <WidgetAction>{tSavings("action")}</WidgetAction>
      </WidgetFooter>
    </Widget>
  );
}
