"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarSyncIcon,
  ShapesIcon,
  TagsIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTransactionsStore } from "~/lib/stores/transaction";
import { TRANSACTION_FREQUENCY } from "~/shared/constants/enum";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";

import { SelectCategory } from "../transaction-category/select-category";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
  ids: string[];
};

export function BulkActions({ ids }: Props) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);

  const tScoped = useScopedI18n("transaction.action_bar");
  const tFrequency = useScopedI18n("transaction.frequency");

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
    ...trpc.tag.get.queryOptions(),
    enabled: ids.length > 0,
  });

  const handleUpdateTransactionsCategory = (categorySlug?: string) => {
    toast.promise(
      updateTransactionsMutation.mutateAsync({ categorySlug, ids }),
      {
        loading: "Updating transactions...",
        success: "Transactions updated successfully",
        error: "Something went wrong please try again.",
      },
    );
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
          className="max-h-[270px] w-[250px] overflow-y-auto p-0"
          sideOffset={8}
        >
          <SelectCategory
            headless
            onChange={(category) => {
              setCategoryOpen(false);
              handleUpdateTransactionsCategory(category?.slug);
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
                {tag.name}
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <p className="px-2 text-sm text-[#878787]">No tags found</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu open={recurringOpen} onOpenChange={setRecurringOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger className="flex size-9 items-center justify-center hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50">
              <CalendarSyncIcon className="size-4" />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tScoped("recurring_tooltip")}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          className="max-h-[300px] w-[250px] overflow-y-auto py-1"
          sideOffset={8}
        >
          {Object.values(TRANSACTION_FREQUENCY).map((frequency) => (
            <DropdownMenuRadioItem
              key={frequency}
              value={frequency}
              onClick={() => {
                setRecurringOpen(false);
                updateTransactionsMutation.mutate({
                  ids,
                  // a bit of a hack to handle removing recurrency
                  frequency: frequency !== "unknown" ? frequency : undefined,
                  recurring: frequency !== "unknown",
                });
              }}
            >
              {tFrequency(frequency)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="!pointer-events-auto size-9 text-destructive hover:bg-destructive/1 hover:text-destructive"
            disabled={!canDelete}
            onClick={handleDeleteTransactions}
          >
            <Trash2Icon className="size-4" />
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
