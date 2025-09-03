"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>Dividi transazione</DialogTitle>
          <DialogDescription>
            Dividi la transazione in più parti, ognuna con la propria categoria
            e importo. La somma dei splits deve essere uguale all&apos;importo.
          </DialogDescription>
        </DialogHeader>

        {data && (
          <TransactionSplitsEditor
            transaction={data}
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
