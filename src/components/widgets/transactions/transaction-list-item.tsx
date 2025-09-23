"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormatAmount } from "~/components/format-amount";
import { SelectCategory } from "~/components/transaction-category/select-category";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";

type Props = {
  transaction: NonNullable<RouterOutput["transaction"]["get"]["data"]>[number];
  disabled?: boolean;
};

export function TransactionListItem({ transaction, disabled }: Props) {
  const { setParams } = useTransactionParams();

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updateTransactionMutation = useMutation(
    trpc.transaction.updateTransaction.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey({ id: transaction.id }),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.pathKey(),
        });
      },
    }),
  );

  const handleTransactionCategoryUpdate = async (category?: {
    slug: string;
  }) => {
    updateTransactionMutation.mutate({
      id: transaction.id,
      categorySlug: category?.slug,
    });
  };

  return (
    <>
      <div
        onClick={() => setParams({ transactionId: transaction.id })}
        className="w-full"
      >
        <div className="flex max-w-full items-center py-3">
          <div className="flex w-[50%] shrink-0 space-x-2 pr-4">
            <span
              className={cn(
                "line-clamp-1 text-sm",
                disabled && "skeleton-box animate-none",
                transaction?.amount > 0 && "text-emerald-600",
              )}
            >
              {transaction.name}
            </span>
          </div>

          <div className="w-[20%] pr-4">
            <span
              className={cn(
                "line-clamp-1 text-sm",
                disabled && "skeleton-box animate-none",
                transaction?.amount > 0 && "text-emerald-600",
              )}
            >
              <FormatAmount
                amount={transaction.amount}
                currency={transaction.currency}
              />
            </span>
          </div>

          <div className="flex w-[30%] justify-end">
            <SelectCategory
              align="end"
              placeholder="Categorizza..."
              className="max-w-[80%]"
              selected={transaction.category?.slug}
              onChange={async (category) => {
                await handleTransactionCategoryUpdate(category);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
