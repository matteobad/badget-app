"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { FormatAmount } from "~/components/format-amount";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { cn } from "~/lib/utils";

type Props = {
  transaction: NonNullable<RouterOutput["transaction"]["get"]["data"]>[number];
  disabled?: boolean;
};

export function TransactionListItem({ transaction, disabled }: Props) {
  const { setParams } = useTransactionParams();

  return (
    <>
      <div
        onClick={() => setParams({ transactionId: transaction.id })}
        className="w-full"
      >
        <div className="flex items-center py-3">
          <div className="flex w-[65%] space-x-2">
            <span
              className={cn(
                "line-clamp-1 text-sm",
                disabled && "skeleton-box animate-none",
                transaction?.amount > 0 && "text-[#00C969]",
              )}
            >
              {transaction.name}
            </span>
          </div>
          <div className="ml-auto w-[35%]">
            <span
              className={cn(
                "line-clamp-1 text-right text-sm",
                disabled && "skeleton-box animate-none",
                transaction?.category?.slug === "income" && "text-[#00C969]",
              )}
            >
              <FormatAmount
                amount={transaction.amount}
                currency={transaction.currency}
              />
            </span>
          </div>

          {/* <div className="ml-auto">
            <TransactionStatus fullfilled={fullfilled} />
          </div> */}
        </div>
      </div>
    </>
  );
}
