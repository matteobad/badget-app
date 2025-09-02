"use client";

import { useQuery } from "@tanstack/react-query";
import { useMetricsParams } from "~/hooks/use-metrics-params";
import { ACCOUNT_TYPE } from "~/shared/constants/enum";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useI18n } from "~/shared/locales/client";
import { InfoIcon } from "lucide-react";

import { AnimatedNumber } from "../animated-number";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function FinancialMetrics() {
  const t = useI18n();
  const { params } = useMetricsParams();

  const trpc = useTRPC();

  const { data } = useQuery(
    trpc.metrics.financialMetrics.queryOptions({
      from: params.from,
      to: params.to,
    }),
  );

  const { data: accounts } = useQuery(trpc.asset.get.queryOptions());

  return (
    <div className="grid gap-6 p-6 pb-4 lg:grid-cols-3">
      {/* NetWorth */}
      <div className="mb-2 space-y-3 border p-6 select-text">
        <h1 className="font-mono text-4xl">
          <AnimatedNumber
            value={data?.summary.netWorth ?? 0}
            currency={data?.summary.currency ?? "EUR"}
          />
        </h1>
        <div className="flex items-center space-x-2">
          <p>{t("chart_type.net_worth")}</p>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent
                className="max-w-[240px] space-y-2 p-4 text-xs"
                side="bottom"
                sideOffset={10}
              >
                <h3 className="font-medium">
                  {t("account.metrics.net_worth.description")}
                </h3>
                <p>{t("account.metrics.net_worth.info")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("account.metrics.account", { count: accounts?.length ?? 0 })}
        </p>
      </div>

      {/* Assets & Liabilities */}
      {Object.values(ACCOUNT_TYPE).map((accountType) => {
        return (
          <div
            className="mb-2 space-y-3 border p-6 select-text"
            key={accountType}
          >
            <h1 className="font-mono text-4xl">
              <AnimatedNumber
                value={data?.summary[accountType] ?? 0}
                currency={data?.summary.currency ?? "EUR"}
              />
            </h1>
            <div className="flex items-center space-x-2">
              <p>{t(`account.metrics.${accountType}.title`)}</p>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent
                    className="max-w-[240px] space-y-2 p-4 text-xs"
                    side="bottom"
                    sideOffset={10}
                  >
                    <h3 className="font-medium">
                      {t(`account.metrics.${accountType}.description`)}
                    </h3>
                    <p>{t(`account.metrics.${accountType}.info`)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("account.metrics.account", {
                count:
                  accounts?.filter(({ type }) => type === accountType).length ??
                  0,
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
