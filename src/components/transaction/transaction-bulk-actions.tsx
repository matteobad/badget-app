"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTransactionsStore } from "~/lib/stores/transaction";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";
import { ShapesIcon, TagsIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { TransactionCategorySelect } from "./forms/transaction-category-select";

type Props = {
  ids: string[];
};

export function BulkActions({ ids }: Props) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  const tScoped = useScopedI18n("transaction.action_bar");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { setRowSelection, canDelete } = useTransactionsStore();

  const updateTransactionsMutation = useMutation(
    trpc.transaction.updateMany.mutationOptions({
      onSuccess: () => {
        // Invalidate the transaction list query
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });
      },
      onError: (error) => {
        console.error("Something went wrong please try again.", { error });
      },
    }),
  );

  const deleteTransactionsMutation = useMutation(
    trpc.transaction.deleteMany.mutationOptions({
      onSuccess: () => {
        // Invalidate the transaction list query
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });

        // Reset row selection since we deleted the rows
        setRowSelection({});
      },
    }),
  );

  const { data: tags } = useQuery({
    ...trpc.tag.get.queryOptions({}),
    enabled: ids.length > 0,
  });

  const handleUpdateTransactionsCategory = (categoryId?: string) => {
    toast.promise(updateTransactionsMutation.mutateAsync({ categoryId, ids }), {
      loading: "Updating transactions...",
      success: "Transactions updated successfully",
      error: "Something went wrong please try again.",
    });
  };

  const handleDeleteTransactions = () => {
    toast.promise(deleteTransactionsMutation.mutateAsync({ ids }), {
      loading: "Deleting transactions...",
      success: "Transactions deleted successfully",
      error: "Something went wrong please try again.",
    });
  };

  return (
    <div className="flex items-center gap-1 pr-2">
      <DropdownMenu open={categoryOpen} onOpenChange={setCategoryOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger className="flex size-9 items-center justify-center">
              <ShapesIcon className="h-4 w-4" />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tScoped("categories_tooltip")}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          className="max-h-[300px] w-[250px] overflow-y-auto py-1"
          sideOffset={8}
        >
          <TransactionCategorySelect
            selectedItems={[]}
            onSelect={(category) => {
              setCategoryOpen(false);
              handleUpdateTransactionsCategory(category?.id);
            }}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu open={tagOpen} onOpenChange={setTagOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger className="flex size-9 items-center justify-center hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50">
              <TagsIcon className="size-4" />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tScoped("tags_tooltip")}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          className="max-h-[300px] w-[250px] overflow-y-auto py-1"
          sideOffset={8}
        >
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={ids.includes(tag.id)}
                onCheckedChange={() => {
                  setTagOpen(false);
                  updateTransactionsMutation.mutate({
                    ids,
                    tagId: tag.id,
                  });
                }}
              >
                {tag.text}
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <p className="px-2 text-sm text-[#878787]">No tags found</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="size-9 text-destructive hover:bg-destructive/1 hover:text-destructive"
            disabled={!canDelete}
            onClick={handleDeleteTransactions}
          >
            <Trash2Icon className="size-4" />
            <span className="sr-only">{tScoped("delete_tooltip")}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {canDelete
              ? tScoped("delete_tooltip")
              : tScoped("cannot_delete_tooltip")}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
