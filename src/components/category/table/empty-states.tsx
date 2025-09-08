"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { ReceiptIcon, ShapesIcon } from "lucide-react";
import { toast } from "sonner";

import { CreateCategoryButton } from "../create-category-button";

// import { AddAccountButton } from "@/components/add-account-button";

export function NoResults() {
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

        <Button variant="outline">Clear filters</Button>
      </div>
    </div>
  );
}

export function NoCategories() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // const createDefaultCategoriesMutation = useMutation(
  //   trpc.transactionCategory.createDefaults.mutationOptions({
  //     onSuccess: () => {
  //       void queryClient.invalidateQueries({
  //         queryKey: trpc.transactionCategory.get.queryKey(),
  //       });

  //       toast.success("Default categories created");
  //     },
  //   }),
  // );

  return (
    <div className="absolute top-0 left-0 z-20 flex h-[calc(100vh-300px)] w-full items-center justify-center">
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 text-center">
        <ShapesIcon className="text-muted-foreground" />
        <h2 className="text-xl font-medium">No categories</h2>
        <p className="mb-4 text-sm text-[#878787]">
          Create categories to group and organize your transactions. Categories
          help you track your spending, analyze your financial habits, and
          manage your budget more effectively.
        </p>

        <div className="flex gap-2">
          <Button
            className="rounded-none"
            onClick={() => {
              // createDefaultCategoriesMutation.mutate();
            }}
          >
            Use defauls (reccomended)
          </Button>
          <CreateCategoryButton variant="outline" />
        </div>
      </div>
    </div>
  );
}
