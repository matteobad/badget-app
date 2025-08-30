"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { FormatAmount } from "~/components/format-amount";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { cn } from "~/lib/utils";
import { RepeatIcon } from "lucide-react";

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
            <div className="flex w-full items-center justify-between gap-2">
              <Avatar className="size-9">
                {/* <AvatarImage
                  src={transaction.counterpartyName ?? ""}
                  className="object-contain"
                /> */}
                <AvatarFallback className="rounded-full">
                  {transaction.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex h-9 flex-col">
                <span className="line-clamp-1 max-w-[100px] text-sm text-ellipsis md:max-w-none">
                  {transaction.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {transaction.category?.name ?? "Uncategorized"}
                </span>
              </div>
              {transaction.recurring && (
                <RepeatIcon className="size-3.5 text-muted-foreground" />
              )}

              <span className="flex-1"></span>
              {transaction.status === "pending" && (
                <>
                  <div className="flex h-[22px] items-center space-x-1 rounded-md border px-2 py-1 text-[10px] text-[#878787]">
                    <span>Pending</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="ml-auto w-[35%]">
            <span
              className={cn(
                "line-clamp-1 text-right text-sm",
                disabled && "skeleton-box animate-none",
                transaction?.amount > 0 && "text-green-600",
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
