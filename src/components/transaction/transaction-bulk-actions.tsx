"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTransactionsStore } from "~/lib/stores/transaction";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { ChevronDownIcon, ShapesIcon, TagsIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { TransactionCategorySelect } from "./forms/transaction-category-select";

type Props = {
  ids: string[];
};

export function BulkActions({ ids }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { setRowSelection } = useTransactionsStore();

  const updateTransactionsMutation = useMutation(
    trpc.transaction.updateMany.mutationOptions({
      onSuccess: (_, data) => {
        // Invalidate the transaction list query
        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey({}),
        });

        // Reset the row selection
        setRowSelection({});

        toast.success(`Updated ${data?.ids.length} transactions.`);
      },
      onError: () => {
        toast.error("Something went wrong please try again.");
      },
    }),
  );

  const { data: tags } = useQuery({
    ...trpc.tag.get.queryOptions({}),
    enabled: ids.length > 0,
  });

  const handleUpdateTransactionCategory = (categoryId?: string) => {
    toast.promise(updateTransactionsMutation.mutateAsync({ categoryId, ids }), {
      loading: "Updating transactions...",
      success: "Transactions updated successfully",
      error: "Something went wrong please try again.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="space-x-2">
          <span>Actions</span>
          <ChevronDownIcon size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ShapesIcon className="mr-2 h-4 w-4" />
              <span>Categories</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-5}
                className="max-h-[300px] w-[250px] overflow-y-auto py-1"
              >
                <TransactionCategorySelect
                  selectedItems={[]}
                  onSelect={handleUpdateTransactionCategory}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <TagsIcon className="mr-2 h-4 w-4" />
              <span>Tags</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="max-h-[200px] w-[220px] overflow-y-auto py-1"
              >
                {tags && tags.length > 0 ? (
                  tags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag.id}
                      checked={ids.includes(tag.id)}
                      onCheckedChange={() => {
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
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        {/* <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.Visibility className="mr-2 h-4 w-4" />
              <span>Exclude</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={14}>
                <DropdownMenuCheckboxItem
                  onCheckedChange={() => {
                    updateTransactionsMutation.mutate({
                      ids,
                      status: "excluded",
                    });
                  }}
                >
                  Yes
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onCheckedChange={() => {
                    updateTransactionsMutation.mutate({
                      ids,
                      status: "posted",
                    });
                  }}
                >
                  No
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup> */}

        {/* <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.Files className="mr-2 h-4 w-4" />
              <span>Archive</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={14}>
                <DropdownMenuCheckboxItem
                  onCheckedChange={() => {
                    updateTransactionsMutation.mutate({
                      ids,
                      status: "archived",
                    });
                  }}
                >
                  Yes
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onCheckedChange={() => {
                    updateTransactionsMutation.mutate({
                      ids,
                      status: "posted",
                    });
                  }}
                >
                  No
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup> */}

        {/* <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.AlertCircle className="mr-2 h-4 w-4" />
              <span>Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={14}>
                <DropdownMenuCheckboxItem
                  onCheckedChange={() => {
                    updateTransactionsMutation.mutate({
                      ids,
                      status: "completed",
                    });
                  }}
                >
                  Completed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onCheckedChange={() => {
                    updateTransactionsMutation.mutate({
                      ids,
                      status: "posted",
                    });
                  }}
                >
                  Uncompleted
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup> */}

        {/* <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <RepeatIcon className="mr-2 h-4 w-4" />
              <span>Recurring</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={14}>
                {[
                  {
                    label: "None",
                    value: null,
                  },
                  {
                    label: "Weekly",
                    value: "weekly",
                  },
                  {
                    label: "Monthly",
                    value: "monthly",
                  },
                  {
                    label: "Annually",
                    value: "annually",
                  },
                ].map((item) => (
                  <DropdownMenuCheckboxItem
                    key={item.value}
                    onCheckedChange={() => {
                      updateTransactionsMutation.mutate({
                        ids,
                        frequency: item.value as
                          | "weekly"
                          | "monthly"
                          | "annually"
                          | "irregular",
                        recurring: item.value !== null,
                      });
                    }}
                  >
                    {item.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
