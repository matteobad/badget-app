"use client";

import { useChatActions, useChatId } from "@ai-sdk-tools/store";
import { UTCDate } from "@date-fns/utc";
import { useQuery } from "@tanstack/react-query";
import { NetWorthChart } from "~/components/charts/net-worth-chart";
import { useChatInterface } from "~/hooks/use-chat-interface";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { startOfDay, subMonths } from "date-fns";
import { LineChartIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { BaseWidget } from "./base";

const PERIOD = {
  "1M": "1M",
  "3M": "3M",
  "6M": "6M",
  "1Y": "1Y",
} as const;

export function NetWorthWidgetSettings() {
  const tNetWorthSettings = useScopedI18n("widgets.net-worth.settings");

  // const { draftSettings, setDraftSettings } = useWidget();

  return (
    <div className="flex w-full flex-col gap-2">
      <Select
      // onValueChange={(value) => {
      //   const newPeriod = value as PeriodType;
      //   const option = options[newPeriod] ?? options["1M"];
      //   setDraftSettings({ ...draftSettings, period: newPeriod, ...option });
      // }}
      // defaultValue={draftSettings?.period ?? PERIOD["1M"]}
      >
        <SelectTrigger className="w-full" size="sm">
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(PERIOD).map((period) => {
            return (
              <SelectItem value={period} key={period}>
                {tNetWorthSettings(period)}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export function NetWorthWidget() {
  const { sendMessage } = useChatActions();
  const { setChatId } = useChatInterface();

  const chatId = useChatId();

  const tNetWorth = useScopedI18n("widgets.net-worth");

  const { data: space } = useSpaceQuery();
  const trpc = useTRPC();

  const { data } = useQuery({
    ...trpc.widgets.getNetWorth.queryOptions({
      from: subMonths(startOfDay(new UTCDate(new Date())), 1).toISOString(),
      to: startOfDay(new UTCDate(new Date())).toISOString(),
      currency: space?.baseCurrency ?? undefined,
    }),
    ...WIDGET_POLLING_CONFIG,
  });

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

  return (
    <BaseWidget
      title={tNetWorth("title")}
      icon={<LineChartIcon className="size-4 text-muted-foreground" />}
      description={
        <div className="text-sm">
          <span className="text-muted-foreground">
            {tNetWorth("description.part_1")}{" "}
          </span>
          <span className="font-medium text-primary">
            {tNetWorth("description.part_2", {
              value: formatAmount({
                amount: data?.result?.summary?.netWorth ?? 0,
                currency:
                  data?.result?.summary?.currency ??
                  space?.baseCurrency ??
                  "EUR",
              }),
            })}
          </span>
        </div>
      }
      actions={tNetWorth("action")}
      onClick={handleViewAnalysis}
    >
      {/* View mode */}
      <NetWorthChart
        className="pt-2"
        data={data?.result?.result ?? []}
        height={70}
        showAnimation={true}
        showLegend={false}
        showXAxis={false}
        showYAxis={false}
      />

      {/* Edit mode */}
      {/* <NetWorthWidgetSettings /> */}
    </BaseWidget>
  );
}
