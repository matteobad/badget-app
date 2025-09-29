"use client";

import { useQuery } from "@tanstack/react-query";
import { NetWorthChart } from "~/components/charts/net-worth-chart";
import { useSpaceQuery } from "~/hooks/use-space";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { formatISO, subMonths } from "date-fns";
import { LineChartIcon } from "lucide-react";

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
import { NetWorthWidgetSettings } from "./net-worth-widget-settings";

export function NetWorthWidget() {
  const tNetWorth = useScopedI18n("widgets.net-worth");

  const { settings } = useWidget();

  const { data: space } = useSpaceQuery();
  const trpc = useTRPC();

  const { data: netWorthData } = useQuery(
    trpc.reports.getNetWorth.queryOptions({
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
          <LineChartIcon className="size-4 text-muted-foreground" />
          {tNetWorth("title")}
        </WidgetTitle>
        <WidgetDescription>
          <div className="text-sm">
            <span className="text-muted-foreground">
              {tNetWorth("description.part_1")}{" "}
            </span>
            <span className="font-medium text-primary">
              {tNetWorth("description.part_2", {
                value: formatAmount({
                  amount: netWorthData?.summary?.netWorth ?? 0,
                  currency:
                    netWorthData?.summary.currency ??
                    space?.baseCurrency ??
                    "EUR",
                }),
              })}
            </span>
          </div>
        </WidgetDescription>
        <WidgetSettingsTrigger />
      </WidgetHeader>

      {/* View mode */}
      <WidgetContent className="flex flex-col gap-2">
        {/* TODO: handle loading state */}
        <NetWorthChart
          data={netWorthData?.result ?? []}
          height={60}
          showAnimation={true}
          showLegend={false}
        />
      </WidgetContent>

      {/* Edit mode */}
      <WidgetSettings>
        <NetWorthWidgetSettings />
      </WidgetSettings>

      <WidgetFooter>
        <WidgetAction>{tNetWorth("action")}</WidgetAction>
      </WidgetFooter>
    </Widget>
  );
}
