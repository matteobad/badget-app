"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { dynamicIconImports } from "lucide-react/dynamic";
import React, { useCallback, useMemo } from "react";
import {
  checkboxesFeature,
  expandAllFeature,
  hotkeysCoreFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "~/components/ui/checkbox";
import { Tree, TreeItem, TreeItemLabel } from "~/components/ui/tree";
import { useTransactionCategoryFilterParams } from "~/hooks/use-transaction-category-filter-params";
import { useTransactionCategoryParams } from "~/hooks/use-transaction-category-params";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { DynamicIcon } from "lucide-react/dynamic";

const indent = 20;

type TransactionCategory = RouterOutput["transactionCategory"]["get"][number];

export function TransactionCategoryTree() {
  const { filters } = useTransactionCategoryFilterParams();
  const { setParams } = useTransactionCategoryParams();

  const trpc = useTRPC();

  const { data } = useQuery(trpc.transactionCategory.get.queryOptions(filters));

  const transactionCategories = useMemo(() => {
    return data ?? [];
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
    onPrimaryAction(item) {
      void setParams({ categoryId: item.getItemMeta().itemId });
    },
    // canCheckFolders: true,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      checkboxesFeature,
      hotkeysCoreFeature,
      searchFeature,
      expandAllFeature,
    ],
  });

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow">
      <div>
        <Tree
          className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
          indent={indent}
          tree={tree}
        >
          {tree.getItems().map((item) => {
            return (
              <div
                key={item.getId()}
                className="flex items-center gap-1.5 not-last:pb-0.5 data-[visible=false]:hidden"
              >
                <Checkbox
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
                />
                <TreeItem
                  item={item}
                  className="flex-1 not-last:pb-0 data-[visible=false]:hidden"
                >
                  <TreeItemLabel className="relative not-in-data-[folder=true]:ps-2 before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background">
                    <span className="flex items-center gap-2">
                      <DynamicIcon
                        name={
                          item.getItemData()
                            .icon as keyof typeof dynamicIconImports
                        }
                        size={16}
                        aria-hidden="true"
                      />
                      <span className="line-clamp-1 text-left">
                        {item.getItemName()}
                      </span>
                    </span>
                  </TreeItemLabel>
                </TreeItem>
              </div>
            );
          })}
        </Tree>
      </div>
    </div>
  );
}
