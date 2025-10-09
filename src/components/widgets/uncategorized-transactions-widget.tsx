"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleDashed } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "~/components/ui/skeleton";
import { useSpaceQuery } from "~/hooks/use-space";
import { useUserQuery } from "~/hooks/use-user";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";

import { BaseWidget, WidgetSkeleton } from "./base";

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
  const { data: user } = useUserQuery();

  const trpc = useTRPC();
  const router = useRouter();

  const { data, isLoading } = useQuery(
    trpc.widgets.getUncategorized.queryOptions({
      currency: space?.baseCurrency ?? "EUR",
      ...WIDGET_POLLING_CONFIG,
    }),
  );

  const getDescription = () => {
    if (!data?.result?.total) {
      return tUncategorizedTransactions("description_empty");
    }

    return (
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
            locale: user?.locale,
          })}
        </span>
      </div>
    );
  };

  const handleClick = () => {
    router.push(`/transactions?categories=uncategorized`);
  };

  if (isLoading) {
    return <WidgetSkeleton />;
  }

  return (
    <BaseWidget
      title={tUncategorizedTransactions("title")}
      icon={<CircleDashed className="size-4 text-muted-foreground" />}
      description={data && getDescription()}
      actions={data && tUncategorizedTransactions("action")}
      onClick={data && handleClick}
    />
  );
}
