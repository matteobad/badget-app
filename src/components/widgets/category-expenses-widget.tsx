"use client";

import { UTCDate } from "@date-fns/utc";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "~/components/ui/skeleton";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { ShapesIcon } from "lucide-react";

import { BaseWidget } from "./base";

function CategoryExpensesWidgetSkeleton() {
  return (
    <>
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-[110px]" />
        <Skeleton className="h-3 w-[100px]" />
        <Skeleton className="h-3 w-[20px]" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-[110px]" />
        <Skeleton className="h-3 w-[70]" />
        <Skeleton className="h-3 w-[20px]" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-[110px]" />
        <Skeleton className="h-3 w-[50px]" />
        <Skeleton className="h-3 w-[20px]" />
      </div>
    </>
  );
}

export function CategoryExpensesWidget() {
  const tScoped = useScopedI18n("widgets.category-expenses");

  const { data: space } = useSpaceQuery();

  const trpc = useTRPC();

  const { data, isLoading } = useQuery({
    ...trpc.widgets.getCategoryExpenses.queryOptions({
      from: startOfMonth(new UTCDate(new Date())).toISOString(),
      to: endOfMonth(new UTCDate(new Date())).toISOString(),
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const spendingCategories = data?.result.spendingCategories ?? [];
  const categoriesCount = spendingCategories?.length ?? 0;
  const higherValue = spendingCategories[0]?.amount ?? 1;

  const handleClick = () => {
    // TODO: Navigate to cash flow analysis page
    console.log("View cash flow analysis clicked");
  };

  return (
    <BaseWidget
      title={tScoped("title")}
      description={tScoped("description", { count: categoriesCount })}
      icon={<ShapesIcon className="size-4 text-muted-foreground" />}
      actions={tScoped("action")}
      onClick={handleClick}
    >
      <div className="flex flex-1 flex-col justify-end gap-1 pb-2">
        {isLoading ? (
          <CategoryExpensesWidgetSkeleton />
        ) : (
          spendingCategories.slice(0, 3).map((category) => {
            return (
              <div className="flex items-center gap-4" key={category.slug}>
                <span className="line-clamp-1 w-[110px] shrink-0 text-xs text-muted-foreground">
                  {category.name}
                </span>
                <div className="flex h-3 w-full items-center gap-2">
                  <span
                    className="h-3"
                    style={{
                      backgroundColor: category.color ?? "#fafafa",
                      width: `${(category.amount * 100) / higherValue}%`,
                    }}
                  ></span>
                  <span className="font-mono text-xs">
                    {formatAmount({
                      amount: category.amount,
                      currency:
                        category.currency ?? space?.baseCurrency ?? "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </BaseWidget>
  );
}
