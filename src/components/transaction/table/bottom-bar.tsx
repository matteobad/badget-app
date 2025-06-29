"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useTransactionFilterParams } from "~/hooks/use-transaction-filter-params";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useI18n } from "~/shared/locales/client";
import { motion } from "framer-motion";
import { InfoIcon } from "lucide-react";

type Transaction = {
  amount: number;
  currency: string;
};

export function BottomBar() {
  const t = useI18n();
  const trpc = useTRPC();
  const { filter } = useTransactionFilterParams();
  const { data: transactions, isLoading } = useQuery({
    ...trpc.transaction.get.queryOptions({
      ...filter,
      pageSize: 10000,
    }),
  });

  const totalAmount = useMemo(() => {
    const totals: Transaction[] = [];

    for (const transaction of transactions?.data ?? []) {
      if (!transaction.amount || !transaction.currency) continue;

      const existingTotal = totals.find(
        (total) => total.currency === transaction.currency,
      );

      if (existingTotal) {
        existingTotal.amount += transaction.amount;
      } else {
        totals.push({
          currency: transaction.currency,
          amount: transaction.amount,
        });
      }
    }

    return totals;
  }, [transactions]);

  const multiCurrency = totalAmount && totalAmount.length > 1;

  const amountPerCurrency = totalAmount
    .map((total) =>
      formatAmount({
        amount: total?.amount,
        currency: total.currency,
        // locale: user?.locale ?? undefined,
      }),
    )
    .join(", ");

  if (isLoading) return null;

  return (
    <motion.div
      className="pointer-events-none fixed right-0 bottom-4 left-0 flex h-12 justify-center"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="pointer-events-auto flex h-12 items-center justify-between space-x-2 border border-[#DCDAD2] bg-[#F6F6F3]/80 px-4 backdrop-filter dark:border-[#2C2C2C] dark:bg-[#1A1A1A]/80">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="flex items-center space-x-2">
              <InfoIcon className="text-[#606060]" />
              <span className="text-sm">
                {multiCurrency
                  ? t("bottom_bar.multi_currency")
                  : totalAmount.length > 0 &&
                    totalAmount[0] &&
                    formatAmount({
                      amount: totalAmount[0].amount,
                      currency: totalAmount[0].currency,
                      // locale: user?.locale ?? undefined,
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    })}
              </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={30} className="px-3 py-1.5 text-xs">
              {multiCurrency ? amountPerCurrency : t("bottom_bar.description")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <span className="text-sm text-[#878787]">
          (
          {t("bottom_bar.transactions", {
            count: transactions?.data?.length ?? 0,
          })}
          )
        </span>
      </div>
    </motion.div>
  );
}
