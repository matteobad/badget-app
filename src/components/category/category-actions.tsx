"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { MoreHorizontalIcon } from "lucide-react";

import { CreateCategoryButton } from "./create-category-button";

export const CategoryActions = () => {
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
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        className="rounded-none"
        onClick={() => {
          resetTransactionCategoriesMutation.mutate();
        }}
      >
        <MoreHorizontalIcon className="size-4" />
      </Button>
      <CreateCategoryButton />
    </div>
  );
};
