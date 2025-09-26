"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatedNumber } from "~/components/animated-number";
import { Progress } from "~/components/ui/progress";
import { useSpaceQuery } from "~/hooks/use-space";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
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

export function CategoryBreakdownWidget() {
  const [amount, setAmount] = useState(0);
  const { data: space } = useSpaceQuery();

  // TODO: get income from trpc procedure with settings params
  // or get all and filter on client ?
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.reports.getCategoryBreakdown.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    }),
  );

  const higherValue = data?.result[0]?.total ?? 1;

  return (
    <WidgetProvider>
      <Widget>
        <WidgetHeader>
          <WidgetTitle className="flex items-center gap-3">
            <TrendingUpIcon className="size-4 text-muted-foreground" />
            Category expenses
          </WidgetTitle>
        </WidgetHeader>

        <WidgetContent className="flex flex-col gap-2">
          {data?.result.map((item) => {
            return (
              <div className="flex items-center gap-4">
                <span className="line-clamp-1 w-[110px] shrink-0 text-xs text-muted-foreground">
                  {item.categoryName}
                </span>
                <div className="flex h-3 w-full items-center gap-2">
                  <span
                    className="h-3"
                    style={{
                      backgroundColor: item.categoryColor ?? "#fafafa",
                      width: `${(item.total * 100) / higherValue}%`,
                    }}
                  ></span>
                  <span className="font-mono text-xs">
                    {formatAmount({
                      amount: item.total,
                      currency:
                        data.meta.currency ?? space?.baseCurrency ?? "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </WidgetContent>

        <WidgetFooter>
          <WidgetAction>See detailed graph</WidgetAction>
        </WidgetFooter>
      </Widget>
    </WidgetProvider>
  );
}
