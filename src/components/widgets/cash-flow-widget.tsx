import { UTCDate } from "@date-fns/utc";
import { useQuery } from "@tanstack/react-query";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { ScaleIcon } from "lucide-react";

import { AnimatedNumber } from "../animated-number";
import { BaseWidget } from "./base";

export function CashFlowWidget() {
  const tScoped = useScopedI18n("widgets.cash-flow");

  const trpc = useTRPC();

  const { data: space } = useSpaceQuery();

  const { data } = useQuery({
    ...trpc.widgets.getCashFlow.queryOptions({
      from: startOfMonth(new UTCDate(new Date())).toISOString(),
      to: endOfMonth(new UTCDate(new Date())).toISOString(),
      currency: space?.baseCurrency ?? "EUR",
      period: "monthly",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const handleClick = () => {
    // TODO: Navigate to cash flow analysis page
    console.log("View cash flow analysis clicked");
  };

  return (
    <BaseWidget
      title={tScoped("title")}
      icon={<ScaleIcon className="size-4" />}
      description={tScoped("description", {
        count: data?.result.netCashFlow ?? 0,
      })}
      actions={tScoped("action")}
      onClick={handleClick}
    >
      <div className="flex flex-1 items-end gap-2">
        <span className="text-2xl">
          <AnimatedNumber
            value={data?.result.netCashFlow ?? 0}
            currency={data?.result.currency ?? space?.baseCurrency ?? "EUR"}
          />
        </span>
      </div>
    </BaseWidget>
  );
}
