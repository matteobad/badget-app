"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import React, { useCallback, useMemo } from "react";
import {
  expandAllFeature,
  hotkeysCoreFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { useQuery } from "@tanstack/react-query";
import { Tree, TreeItem, TreeItemLabel } from "~/components/ui/tree";
import { useTransactionCategoryFilterParams } from "~/hooks/use-transaction-category-filter-params";
import { useTransactionCategoryParams } from "~/hooks/use-transaction-category-params";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CategoryBadge } from "./category-badge";

const indent = 28;

type TransactionCategory = RouterOutput["transactionCategory"]["get"][number];

export function TransactionCategoryTree() {
  const { filters } = useTransactionCategoryFilterParams();
  const { setParams } = useTransactionCategoryParams();

  const trpc = useTRPC();

  const { data } = useQuery(trpc.transactionCategory.get.queryOptions(filters));

  const transactionCategories = useMemo(() => {
    if (!data) return [];

    // Map categories to use slug as id and parentId as parent slug
    const mapped = data.map((category) => {
      const parentCategory = data.find((c) => c.id === category.parentId);
      return {
        ...category,
        id: category.slug,
        parentId: parentCategory?.slug ?? null,
      };
    });

    // Custom sort: alphabetically by name, but keep 'uncategorized' and 'transfer' last (in that order)
    const uncategorizedIndex = mapped.findIndex(
      (cat) => cat.slug === "uncategorized",
    );

    // Remove uncategorized and transfer from the array for now
    const uncategorized =
      uncategorizedIndex !== -1
        ? mapped.splice(uncategorizedIndex, 1)[0]
        : null;
    // After removing uncategorized, transfer's index may have changed
    const transferIndexAfter = mapped.findIndex(
      (cat) => cat.slug === "transfer",
    );
    const transfer =
      transferIndexAfter !== -1
        ? mapped.splice(transferIndexAfter, 1)[0]
        : null;

    // Sort the rest alphabetically by name (case-insensitive)
    mapped.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    // Add uncategorized and transfer at the end, in that order
    if (uncategorized) mapped.push(uncategorized);
    if (transfer) mapped.push(transfer);

    return mapped;
  }, [data]);

  const getTransactionCategory = useCallback(
    (categoryId: string) => {
      return transactionCategories.find((item) => item.id === categoryId)!;
    },
    [transactionCategories],
  );

  const getTransactionCategoryChildren = useCallback(
    (categoryId: string) => {
      return transactionCategories
        .filter((item) => item.parentId === categoryId)
        .map((item) => item.id);
    },
    [transactionCategories],
  );

  const tree = useTree<TransactionCategory>({
    indent,
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) =>
      getTransactionCategoryChildren(item.getItemMeta().itemId).length > 0,
    dataLoader: {
      getItem: getTransactionCategory,
      getChildren: getTransactionCategoryChildren,
    },
    // canCheckFolders: true,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      // checkboxesFeature,
      hotkeysCoreFeature,
      searchFeature,
      expandAllFeature,
    ],
  });

  return (
    <div className="flex h-full flex-col *:first:grow">
      <div className="flex h-12 items-center border border-b-0">
        <span className="flex h-12 grow items-center border-r px-4 text-sm font-medium text-muted-foreground">
          Name
        </span>
        <span className="size-12 shrink-0"></span>
      </div>
      <div>
        <Tree className="relative" indent={indent} tree={tree}>
          {tree.getItems().map((item) => {
            const category = item.getItemData();

            return (
              <div
                key={item.getId()}
                className="flex items-center gap-3 border-x border-t not-last:pb-0 last:border-b data-[visible=false]:hidden"
              >
                {/* <Checkbox
                  checked={
                    {
                      checked: true,
                      unchecked: false,
                      indeterminate: "indeterminate" as const,
                    }[item.getCheckedState()]
                  }
                  onCheckedChange={(checked) => {
                    const checkboxProps = item.getCheckboxProps();
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    checkboxProps.onChange?.({ target: { checked } });
                  }}
                /> */}
                <TreeItem
                  item={item}
                  className="flex flex-1 items-center justify-between not-last:pb-0 data-[visible=false]:hidden"
                >
                  <TreeItemLabel className="relative h-12 grow gap-3 border-r ps-4 not-in-data-[folder=true]:ps-4 hover:bg-transparent in-data-[drag-target=true]:bg-transparent in-data-[selected=true]:bg-transparent">
                    <span className="flex items-center gap-2">
                      <CategoryBadge category={category} />
                      {category.system && (
                        <Badge
                          variant="outline"
                          className="text-xs font-normal text-muted-foreground"
                        >
                          System
                        </Badge>
                      )}
                    </span>
                  </TreeItemLabel>

                  <div className="flex size-12 items-center justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex size-9 shrink-0 items-center justify-center hover:bg-accent">
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48" align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Add subcategory</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TreeItem>
              </div>
            );
          })}
        </Tree>
      </div>
    </div>
  );
}
