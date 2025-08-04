"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { FormatAmount } from "~/components/format-amount";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { formatDate } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { ReceiptIcon } from "lucide-react";

import type { TransactionType } from "./data";

type Props = {
  type: TransactionType;
  disabled: boolean;
};

export function TransactionsList({ type }: Props) {
  const trpc = useTRPC();

  const { data: transactions } = useSuspenseQuery(
    trpc.transaction.get.queryOptions({
      pageSize: 15,
      type: type === "all" ? undefined : type,
    }),
  );

  if (!transactions?.data?.length) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2">
        <ReceiptIcon className="text-muted-foreground" />
        <p className="w-[50%] text-center text-sm text-[#606060]">
          No transactions found have been found in this period.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* <TransactionsListHeader /> */}

      <div className="h-full space-y-1 overflow-auto">
        {transactions.data.map((transaction) => (
          <div
            key={transaction.id}
            className={cn(
              "group flex items-center gap-3 py-2",
              "transition-all duration-200",
            )}
          >
            <div
              className={cn(
                "rounded-lg p-2",
                "bg-zinc-100 dark:bg-zinc-800",
                "border border-zinc-200 dark:border-zinc-700",
              )}
            >
              <Avatar className="size-4">
                <AvatarImage
                  src={transaction.counterpartyName ?? ""}
                  className="object-contain"
                />
                <AvatarFallback className="rounded-full">
                  {transaction.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="line-clamp-1 max-w-[150px] text-sm md:max-w-none">
                  {transaction.name}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(transaction.date)}
                </p>
              </div>

              <div className="flex min-w-[120px] items-center justify-end gap-1.5 pl-3">
                <FormatAmount
                  amount={transaction.amount}
                  currency={transaction.currency}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
