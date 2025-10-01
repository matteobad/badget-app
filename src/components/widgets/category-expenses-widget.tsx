"use client";

import { useRouter } from "next/navigation";
import { UTCDate } from "@date-fns/utc";
import { useQuery } from "@tanstack/react-query";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatCompactAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { ShapesIcon } from "lucide-react";

import { BaseWidget } from "./base";

export function CategoryExpensesWidget() {
  const tScoped = useScopedI18n("widgets.category-expenses");
  const trpc = useTRPC();
  const router = useRouter();

  const { data: space } = useSpaceQuery();

  const now = new Date();
  const from = format(startOfMonth(now), "yyyy-MM-dd");
  const to = format(endOfMonth(now), "yyyy-MM-dd");

  const { data } = useQuery({
    ...trpc.widgets.getCategoryExpenses.queryOptions({
      from: startOfMonth(new UTCDate(new Date())).toISOString(),
      to: endOfMonth(new UTCDate(new Date())).toISOString(),
      currency: space?.baseCurrency ?? "EUR",
      limit: 3,
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const categoryData = data?.result;
  const categories = categoryData?.result.categories ?? [];
  const maxAmount = categories[0]?.amount || 0;

  const hasCategories = categoryData && categories.length > 0;

  const handleViewCategories = () => {
    if (!hasCategories) return;
    router.push(
      `/transactions?categories=${categories.map((category) => category.slug).join(",")}&start=${from}&end=${to}`,
    );
  };

  return (
    <BaseWidget
      title={tScoped("title")}
      description={
        hasCategories ? (
          <div className="flex w-full flex-col gap-2">
            {categories.map((category, index) => {
              const percentage =
                maxAmount > 0 ? (category.amount / maxAmount) * 100 : 0;

              const barColor =
                index === 0
                  ? "bg-primary"
                  : index === 1
                    ? "bg-[#A0A0A0]"
                    : "bg-[#606060]";

              return (
                <div key={category.slug} className="flex items-center gap-3">
                  <span className="w-[110px] shrink-0 truncate text-xs text-[#878787]">
                    {category.name}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <div
                      className="h-2 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    >
                      <div className={`h-full ${barColor}`} />
                    </div>
                    <span className="shrink-0 text-xs tabular-nums">
                      {formatCompactAmount(category.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {tScoped("description")}
          </p>
        )
      }
      icon={<ShapesIcon className="size-4" />}
      onClick={hasCategories ? handleViewCategories : undefined}
      actions={hasCategories ? tScoped("action") : undefined}
    />
  );
}
