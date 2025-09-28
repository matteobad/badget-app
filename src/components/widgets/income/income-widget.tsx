"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatedNumber } from "~/components/animated-number";
import { useSpaceQuery } from "~/hooks/use-space";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { TrendingUpIcon } from "lucide-react";
import { toast } from "sonner";

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
  defaultSettings: {
    period?: "month";
    type?: "gross" | "net";
  };
};

export function IncomeWidget(props: Props) {
  const [settings, setSettings] = useState(props.defaultSettings);
  const [amount, setAmount] = useState(0);
  const { data: space } = useSpaceQuery();

  // TODO: get income from trpc procedure with settings params
  // or get all and filter on client ?
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.reports.getIncomes.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  );

  const updateUserWidgetMutation = useMutation(
    trpc.preferences.updateUserWidget.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.preferences.getUserWidgets.queryKey(),
        });
      },
    }),
  );

  const handleSettingsSave = () => {
    updateUserWidgetMutation.mutate({
      id: "income",
      settings,
    });
  };

  useEffect(() => {
    if (data) {
      setAmount(
        settings?.type === "gross"
          ? data.summary.grossIncome
          : data.summary.netIncome,
      );
    }
  }, [data]);

  return (
    <WidgetProvider onSettingsChange={handleSettingsSave}>
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
            <AnimatedNumber
              value={amount}
              currency={data?.summary.currency ?? space?.baseCurrency ?? "EUR"}
            />
          </span>
        </WidgetContent>

        <WidgetSettings>
          <IncomeWidgetSettingsForm
            settings={settings}
            setSettings={setSettings}
          />
        </WidgetSettings>

        <WidgetFooter>
          <WidgetAction>View income trends</WidgetAction>
        </WidgetFooter>
      </Widget>
    </WidgetProvider>
  );
}
