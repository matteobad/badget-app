"use client";

import { useRouter } from "next/navigation";
import { UTCDate } from "@date-fns/utc";
import { useQuery } from "@tanstack/react-query";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { CalendarSyncIcon } from "lucide-react";

import { AnimatedNumber } from "../animated-number";
import { BaseWidget } from "./base";

export function RecurringExpensesWidget() {
  const tScoped = useScopedI18n("widgets.recurring-expenses");

  const trpc = useTRPC();
  const router = useRouter();

  const { data: space } = useSpaceQuery();

  const { data } = useQuery({
    ...trpc.widgets.getRecurringExpenses.queryOptions({
      from: startOfMonth(new UTCDate(new Date())).toISOString(),
      to: endOfMonth(new UTCDate(new Date())).toISOString(),
      currency: space?.baseCurrency ?? "EUR",
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const recurringData = data?.result;

  const getDescription = () => {
    if (!recurringData || recurringData.summary.totalExpenses === 0) {
      return "No recurring expenses tracked";
    }

    const { totalExpenses, byFrequency } = recurringData.summary;

    // Find the frequency with the most expenses
    const frequencies = [
      { type: "monthly", count: byFrequency.monthly, label: "monthly" },
      { type: "annually", count: byFrequency.annually, label: "annual" },
      { type: "weekly", count: byFrequency.weekly, label: "weekly" },
    ];

    const topFrequency = frequencies.find((f) => f.count > 0);

    if (topFrequency && totalExpenses === 1) {
      return `1 ${topFrequency.label} recurring expense`;
    }

    if (topFrequency) {
      return `${totalExpenses} recurring expenses tracked`;
    }

    return "Track your recurring costs";
  };

  const handleViewRecurring = () => {
    router.push("/transactions?recurring=monthly");
  };

  return (
    <BaseWidget
      title={tScoped("title")}
      icon={<CalendarSyncIcon className="size-4" />}
      description={getDescription()}
      onClick={handleViewRecurring}
      actions={tScoped("action")}
    >
      <div className="flex flex-1 items-end gap-2">
        <div className="flex w-full items-baseline">
          <span className="text-2xl">
            <AnimatedNumber
              value={recurringData?.summary.totalMonthlyEquivalent ?? 0}
              currency={
                recurringData?.summary.currency ?? space?.baseCurrency ?? "EUR"
              }
            />
          </span>
          <span className="ml-1 text-xs text-muted-foreground">/month</span>
        </div>
      </div>
    </BaseWidget>
  );
}
