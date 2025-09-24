"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { ReceiptIcon } from "lucide-react";

import type { TransactionType } from "./data";
import { TransactionsItemList } from "./transactions-item-list";

type Props = {
  type: TransactionType;
  disabled: boolean;
};

export function TransactionsList({ type, disabled }: Props) {
  const trpc = useTRPC();

  const { data: transactions } = useSuspenseQuery(
    trpc.transaction.get.queryOptions({
      type: type === "all" ? undefined : type,
      pageSize: 15,
    }),
  );

  if (!transactions?.data?.length) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2">
        <ReceiptIcon className="text-muted-foreground" />
        <p className="w-[50%] text-center text-sm text-muted-foreground">
          No transactions found.
        </p>
      </div>
    );
  }

  return (
    <TransactionsItemList
      transactions={transactions?.data}
      disabled={disabled}
    />
  );
}
