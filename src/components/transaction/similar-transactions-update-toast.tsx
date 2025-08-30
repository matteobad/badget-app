"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { toast } from "sonner";

import { Button } from "../ui/button";

type SimilarTransactionsUpdateToastProps = {
  similarTransactions: { id: string }[];
  category: { id: string; name: string };
  transactionId: string;
  toastId: string | number;
};

export function SimilarTransactionsUpdateToast({
  category,
  similarTransactions,
  transactionId,
  toastId,
}: SimilarTransactionsUpdateToastProps) {
  const tScoped = useScopedI18n("transaction");

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const updateTransactionsMutation = useMutation(
    trpc.transaction.updateMany.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey({ id: transactionId }),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
      },
    }),
  );

  return (
    <div className="p-4">
      <div className="mb-1 font-semibold">Badget AI</div>
      <div className="mb-2 text-sm">
        {tScoped("similar", { count: similarTransactions.length })}
      </div>
      <div className="mt-4 flex space-x-2">
        <Button variant="secondary" onClick={() => toast.dismiss(toastId)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const similarTransactionIds = similarTransactions.map(
              (tr) => tr.id,
            );
            updateTransactionsMutation.mutate({
              ids: similarTransactionIds,
              categoryId: category.id,
            });
            toast.dismiss(toastId);
          }}
        >
          Yes
        </Button>
      </div>
    </div>
  );
}
