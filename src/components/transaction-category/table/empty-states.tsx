"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReceiptIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useTransactionCategoryFilterParams } from "~/hooks/use-transaction-category-filter-params";
import { useTRPC } from "~/shared/helpers/trpc/client";

export function NoResults() {
  const { clearAllFilters } = useTransactionCategoryFilterParams();

  return (
    <div className="flex h-[calc(100vh-300px)] items-center justify-center">
      <div className="flex flex-col items-center">
        <ReceiptIcon className="mb-4" />
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-lg font-medium">No results</h2>
          <p className="text-sm text-[#606060]">
            Try another search, or adjusting the filters
          </p>
        </div>

        <Button variant="outline" onClick={clearAllFilters}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}

export function NoCategories() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const resetTransactionCategoriesMutation = useMutation(
    trpc.transactionCategory.reset.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transactionCategory.get.queryKey(),
        });
      },
    }),
  );

  return (
    <div className="absolute top-0 left-0 z-20 flex h-[calc(100vh-300px)] w-full items-center justify-center">
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-medium">No categories</h2>
        <p className="mb-6 text-sm text-[#878787]">
          You haven&apos;t created any categories yet. Start by adding your own
          categories to organize your transactions, or use default one&apos;s to
          start categorize your spending.
        </p>

        <Button
          type="button"
          onClick={() => {
            resetTransactionCategoriesMutation.mutate();
          }}
        >
          Use default categories
        </Button>
      </div>
    </div>
  );
}
