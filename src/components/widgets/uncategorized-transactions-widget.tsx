"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "~/components/ui/skeleton";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { CircleDashed } from "lucide-react";

import { BaseWidget } from "./base";

export function UncategorizedTransactionsSkeleton() {
  return (
    <>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-[100px]" />
    </>
  );
}

export function UncategorizedTransactionsWidget() {
  const tUncategorizedTransactions = useScopedI18n(
    "widgets.uncategorized-transactions",
  );

  const { data: space } = useSpaceQuery();

  const trpc = useTRPC();

  const { data } = useQuery(
    trpc.reports.getUncategorized.queryOptions({
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
      ...WIDGET_POLLING_CONFIG,
    }),
  );

  const handleClick = () => {
    // TODO: Navigate to cash flow analysis page
    console.log("View cash flow analysis clicked");
  };

  return (
    <BaseWidget
      title={tUncategorizedTransactions("title")}
      icon={<CircleDashed className="size-4 text-muted-foreground" />}
      description={
        <div className="text-sm">
          <span className="text-muted-foreground">
            {tUncategorizedTransactions("description.part_1")}
          </span>
          <span className="font-medium">
            {tUncategorizedTransactions("description.part_2", {
              count: data?.result?.count ?? 0,
            })}
          </span>
          <span className="text-muted-foreground">
            {tUncategorizedTransactions("description.part_3")}
          </span>
          <span className="font-medium">
            {formatAmount({
              amount: data?.result?.total ?? 0,
              currency: data?.summary.currency ?? space?.baseCurrency ?? "EUR",
            })}
          </span>
        </div>
      }
      actions={tUncategorizedTransactions("action")}
      onClick={handleClick}
    >
      <div />
    </BaseWidget>
  );
}
