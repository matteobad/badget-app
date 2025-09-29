"use client";

import { useQuery } from "@tanstack/react-query";
import { AverageSavingsChart } from "~/components/charts/average-savings-chart";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import {
  endOfMonth,
  format,
  formatISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { PiggyBankIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { BaseWidget } from "./base";

const PERIOD = {
  "3M": "3M",
  "6M": "6M",
  "1Y": "1Y",
} as const;
type PeriodType = (typeof PERIOD)[keyof typeof PERIOD];

const options: Record<PeriodType, { from: string; to: string }> = {
  "3M": {
    from: formatISO(subMonths(startOfMonth(new Date()), 2), {
      representation: "date",
    }),
    to: formatISO(endOfMonth(new Date()), { representation: "date" }),
  },
  "6M": {
    from: formatISO(subMonths(startOfMonth(new Date()), 5), {
      representation: "date",
    }),
    to: formatISO(endOfMonth(new Date()), { representation: "date" }),
  },
  "1Y": {
    from: formatISO(subMonths(startOfMonth(new Date()), 11), {
      representation: "date",
    }),
    to: formatISO(endOfMonth(new Date()), { representation: "date" }),
  },
};

export function SavingsWidgetSettings() {
  const tAverageSavingsSettings = useScopedI18n("widgets.savings.settings");

  // const { draftSettings, setDraftSettings } = useWidget();

  return (
    <div className="flex w-full flex-col gap-2">
      <Select
      // onValueChange={(value) => {
      //   const newPeriod = value as PeriodType;
      //   const option = options[newPeriod] ?? options["3M"];
      //   setDraftSettings({ ...draftSettings, period: newPeriod, ...option });
      // }}
      // defaultValue={draftSettings?.period ?? PERIOD["3M"]}
      >
        <SelectTrigger className="w-full" size="sm">
          <SelectValue placeholder="Periodo" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(PERIOD).map((period) => {
            return (
              <SelectItem value={period}>
                {tAverageSavingsSettings(period)}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SavingsWidget() {
  const tSavings = useScopedI18n("widgets.savings");

  const { data: space } = useSpaceQuery();
  const trpc = useTRPC();

  const { data: savingsData, isLoading } = useQuery(
    trpc.reports.getSavings.queryOptions({
      from: format(subMonths(new Date(), 5), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
      ...WIDGET_POLLING_CONFIG,
    }),
  );

  const handleClick = () => {
    // TODO: Navigate to cash flow analysis page
    console.log("View cash flow analysis clicked");
  };

  return (
    <BaseWidget
      title={tSavings("title")}
      icon={<PiggyBankIcon className="size-4 text-muted-foreground" />}
      description={
        <div className="text-sm">
          <span className="text-muted-foreground">
            {tSavings("description.part_1")}
          </span>
          <span className="font-medium text-primary">
            {tSavings("description.part_2", {
              value: formatAmount({
                amount: savingsData?.summary?.savings ?? 0,
                currency:
                  savingsData?.summary.currency ?? space?.baseCurrency ?? "EUR",
                maximumFractionDigits: 0,
              }),
              count: savingsData?.result.length,
            })}
          </span>
        </div>
      }
      actions={tSavings("action")}
      onClick={handleClick}
    >
      <AverageSavingsChart
        data={savingsData?.result ?? []}
        height={70}
        showAnimation={true}
        showLegend={false}
      />
    </BaseWidget>
  );
}
