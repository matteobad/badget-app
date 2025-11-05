"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";

type Category = {
  id?: string;
  name: string;
  slug: string;
};

type UseUpdateTransactionCategoryOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useUpdateTransactionCategory(
  options?: UseUpdateTransactionCategoryOptions,
) {
  const tScoped = useScopedI18n("transaction");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateTransactionMutation = useMutation(
    trpc.transaction.updateTransaction.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: options?.onError,
    }),
  );

  const updateTransactionsMutation = useMutation(
    trpc.transaction.updateMany.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey(),
        });
      },
    }),
  );

  const updateCategory = async (
    transactionId: string,
    transactionName: string,
    category: Category,
  ) => {
    // Update the transaction first
    await updateTransactionMutation.mutateAsync({
      id: transactionId,
      categorySlug: category.slug,
    });

    // Check for similar transactions
    const similarTransactions = await queryClient.fetchQuery(
      trpc.transaction.getSimilarTransactions.queryOptions({
        transactionId,
        name: transactionName,
        categorySlug: category.slug,
      }),
    );

    // Show prompt if similar transactions found
    if (similarTransactions?.length && similarTransactions.length > 0) {
      toast.custom(
        (toastId) => (
          <div className="p-4">
            <div className="mb-1 font-semibold">Badget AI</div>
            <div className="mb-2 text-sm">
              {tScoped("similar", { count: similarTransactions.length })}
            </div>
            <div className="mt-4 flex space-x-2">
              <Button
                variant="secondary"
                onClick={() => toast.dismiss(toastId)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const similarTransactionIds = similarTransactions.map(
                    (tr) => tr.id,
                  );
                  updateTransactionsMutation.mutate({
                    ids: similarTransactionIds,
                    categorySlug: category.slug,
                  });
                  toast.dismiss(toastId);
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        ),
        { duration: 6000 },
      );
    }
  };

  return {
    updateCategory,
    isUpdating: updateTransactionMutation.isPending,
    isUpdatingSimilar: updateTransactionsMutation.isPending,
  };
}
