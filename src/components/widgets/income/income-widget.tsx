"use client";

import { useSpaceQuery } from "~/hooks/use-space";
import { formatAmount } from "~/shared/helpers/format";
import { TrendingUpIcon } from "lucide-react";

import {
  Widget,
  WidgetAction,
  WidgetContent,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetProvider,
  WidgetSettings,
  WidgetSettingsTrigger,
  WidgetTitle,
} from "../widget";
import { IncomeWidgetSettingsForm } from "./income-widget-settings-form";

type Props = {
  settings: {
    period: "month";
    type: "gross" | "net";
  };
};

export function IncomeWidget({ settings }: Props) {
  const { data: space } = useSpaceQuery();

  // TODO: get income from trpc procedure with settings params
  // or get all and filter on client ?

  return (
    <WidgetProvider>
      <Widget>
        <WidgetHeader>
          <WidgetTitle className="flex items-center gap-3">
            <TrendingUpIcon className="size-4 text-muted-foreground" />
            Income this month
          </WidgetTitle>
          <WidgetDescription>Income</WidgetDescription>

          <WidgetSettingsTrigger />
        </WidgetHeader>

        <WidgetContent className="flex items-end">
          <span className="font-mono text-2xl font-medium">
            {formatAmount({
              amount: 2000,
              currency: space?.baseCurrency ?? "EUR",
            })}
          </span>
        </WidgetContent>

        <WidgetSettings>
          <IncomeWidgetSettingsForm {...settings} />
        </WidgetSettings>

        <WidgetFooter>
          <WidgetAction>View income trends</WidgetAction>
        </WidgetFooter>
      </Widget>
    </WidgetProvider>
  );
}
