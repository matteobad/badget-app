"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";

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
      pageSize: 15,
      type: type === "all" ? undefined : type,
    }),
  );

  if (!transactions?.data?.length) {
    return (
      <div className="flex aspect-square items-center justify-center">
        <p className="-mt-12 text-sm text-[#606060]">No transactions found</p>
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
