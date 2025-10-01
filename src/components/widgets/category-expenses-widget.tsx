"use client";

import { useChatActions, useChatId } from "@ai-sdk-tools/store";
import { UTCDate } from "@date-fns/utc";
import { useQuery } from "@tanstack/react-query";
import { useChatInterface } from "~/hooks/use-chat-interface";
import { useSpaceQuery } from "~/hooks/use-space";
import { WIDGET_POLLING_CONFIG } from "~/shared/constants/widgets";
import { formatCompactAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { ShapesIcon } from "lucide-react";

import { BaseWidget } from "./base";

export function CategoryExpensesWidget() {
  const { sendMessage } = useChatActions();
  const { setChatId } = useChatInterface();

  const chatId = useChatId();

  const tScoped = useScopedI18n("widgets.category-expenses");
  const trpc = useTRPC();

  const { data: space } = useSpaceQuery();

  const { data } = useQuery({
    ...trpc.widgets.getCategoryExpenses.queryOptions({
      from: subMonths(startOfMonth(new UTCDate(new Date())), 1).toISOString(),
      to: subMonths(endOfMonth(new UTCDate(new Date())), 1).toISOString(),
      currency: space?.baseCurrency ?? "EUR",
      limit: 3,
    }),
    ...WIDGET_POLLING_CONFIG,
  });

  const categoryData = data?.result;
  const categories = categoryData?.result.categories ?? [];
  const maxAmount = categories[0]?.amount || 0;

  const hasCategories = categoryData && categories.length > 0;

  const handleClick = () => {
    if (!chatId || !data?.toolCall) return;

    setChatId(chatId);

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: "Category expenses breakdown" }],
      metadata: {
        toolCall: data?.toolCall,
      },
    });

    // router.push(
    //   `/transactions?categories=${categories.map((category) => category.slug).join(",")}&start=${from}&end=${to}`,
    // );
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
      onClick={hasCategories ? handleClick : undefined}
      actions={hasCategories ? tScoped("action") : undefined}
    />
  );
}
