import { useQuery } from "@tanstack/react-query";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { LandmarkIcon } from "lucide-react";

import { BaseWidget } from "./base";

export function CashFlowWidget() {
  const trpc = useTRPC();
  const { data: space } = useSpaceQuery();

  const { data } = useQuery({
    ...trpc.widgets.getCashFlow.queryOptions({
      from: startOfMonth(new Date()).toISOString(),
      to: endOfMonth(new Date()).toISOString(),
      currency: space?.baseCurrency ?? undefined,
      period: "monthly",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const handleViewAnalysis = () => {
    // TODO: Navigate to cash flow analysis page
    console.log("View cash flow analysis clicked");
  };

  const formatCashFlow = (amount: number, currency: string) => {
    const sign = amount >= 0 ? "+" : "";
    return `${sign}${new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  return (
    <BaseWidget
      title="Cash Flow"
      icon={<LandmarkIcon className="size-4" />}
      description={
        <div className="flex flex-col gap-1">
          <p className="text-sm text-[#666666]">Net cash position</p>
        </div>
      }
      actions="View cash flow analysis"
      onClick={handleViewAnalysis}
    >
      <div className="flex flex-1 items-end gap-2">
        <span className="text-2xl">
          {formatCashFlow(
            data?.result.netCashFlow ?? 0,
            data?.result.currency ?? space?.baseCurrency ?? "EUR",
          )}
        </span>
      </div>
    </BaseWidget>
  );
}
