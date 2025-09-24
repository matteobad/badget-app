"use client";

import { Button } from "~/components/ui/button";
import { useSpaceQuery } from "~/hooks/use-space";
import { useUserQuery } from "~/hooks/use-user";
import { formatAmount } from "~/shared/helpers/format";
import { CogIcon, SettingsIcon, TrendingUpIcon } from "lucide-react";

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

export function IncomeWidget() {
  const { data: space } = useSpaceQuery();

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
        <WidgetSettings>Settings di prova</WidgetSettings>

        <WidgetFooter>
          <WidgetAction>View income trends</WidgetAction>
        </WidgetFooter>
      </Widget>
    </WidgetProvider>
  );
}
