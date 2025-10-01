"use client";

import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { formatAmount } from "~/shared/helpers/format";
import { useI18n } from "~/shared/locales/client";
import { motion } from "framer-motion";
import { InfoIcon } from "lucide-react";

type Transaction = {
  amount: number;
  currency: string;
};

type Props = {
  transactions: Array<{
    amount: number | null;
    currency: string | null;
  }>;
};

export function BottomBar({ transactions }: Props) {
  const t = useI18n();

  const totalAmount = useMemo(() => {
    const totals: Transaction[] = [];

    for (const transaction of transactions ?? []) {
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

  return (
    <motion.div
      className="pointer-events-none fixed right-0 bottom-4 left-0 z-10 flex h-12 justify-center"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="pointer-events-auto flex h-12 items-center justify-between space-x-2 border border-[#DCDAD2] bg-[#F6F6F3]/80 px-4 backdrop-filter dark:border-[#2C2C2C] dark:bg-[#1A1A1A]/80">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="flex items-center space-x-2">
              <InfoIcon className="size-5 text-[#606060]" />
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
            count: transactions?.length ?? 0,
          })}
          )
        </span>
      </div>
    </motion.div>
  );
}
