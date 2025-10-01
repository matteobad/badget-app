"use client";

import { useRouter } from "next/navigation";
import { UTCDate } from "@date-fns/utc";
import { useQuery } from "@tanstack/react-query";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { TrendingDownIcon } from "lucide-react";

import { AnimatedNumber } from "../animated-number";
import { BaseWidget } from "./base";

export function MonthlySpendingWidget() {
  const tScoped = useScopedI18n("widgets.monthly-spending");

  const trpc = useTRPC();
  const router = useRouter();

  const { data: space } = useSpaceQuery();

  const { data } = useQuery({
    ...trpc.widgets.getMonthlyExpenses.queryOptions({
      from: startOfMonth(new UTCDate(new Date())).toISOString(),
      to: endOfMonth(new UTCDate(new Date())).toISOString(),
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const spending = data?.result;

  const getDescription = () => {
    if (!spending || spending.totalSpending === 0) {
      return tScoped("description_empty");
    }

    if (spending.topCategory) {
      const topCategory = spending.topCategory.name;
      const percentage = spending.topCategory.percentage.toFixed(0);
      return tScoped("description", { category: topCategory, percentage });
    }

    return tScoped("description_default");
  };

  const handleClick = () => {
    router.push("/transactions?type=expense");
  };

  return (
    <BaseWidget
      title={tScoped("title")}
      icon={<TrendingDownIcon className="size-4" />}
      description={getDescription()}
      onClick={handleClick}
      actions={tScoped("action")}
    >
      <div className="flex flex-1 items-end gap-2">
        <span className="text-2xl">
          <AnimatedNumber
            value={spending?.totalSpending ?? 0}
            currency={spending?.currency ?? space?.baseCurrency ?? "EUR"}
          />
        </span>
      </div>
    </BaseWidget>
  );
}
