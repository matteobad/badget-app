"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { TransactionSplitsEditor } from "../forms/transaction-splits-editor";

export function TransactionSplitDialog() {
  const { params, setParams } = useTransactionParams();

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data } = useQuery(
    trpc.transaction.getById.queryOptions(
      { id: params.splitTransaction! },
      { enabled: !!params.splitTransaction },
    ),
  );

  const open = !!params.splitTransaction;

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        void setParams({ splitTransaction: null });
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Split transaction</DialogTitle>
        </DialogHeader>

        {data && (
          <TransactionSplitsEditor
            transactionId={data.id}
            transactionAmount={data.amount}
            currency={data.currency}
            onSaved={() => {
              // refresh details
              void queryClient.invalidateQueries({
                queryKey: trpc.transaction.getById.queryKey({
                  id: data.id,
                }),
              });
              void queryClient.invalidateQueries({
                queryKey: trpc.transaction.get.infiniteQueryKey(),
              });
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
