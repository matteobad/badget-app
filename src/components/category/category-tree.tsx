"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { IconName } from "lucide-react/dynamic";
import React, { useEffect } from "react";
import {
  hotkeysCoreFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tree, TreeItem, TreeItemLabel } from "~/components/ui/tree";
import { useCategoryFilterParams } from "~/hooks/use-category-filter-params";
import { useCategoryParams } from "~/hooks/use-category-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { MoreVerticalIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

type Category = RouterOutput["category"]["get"][number];

const indent = 20;

type CategoryTreeProps = {
  rootId: string;
  items: Category[];
};

export function CategoryTree(props: CategoryTreeProps) {
  const { items, rootId } = props;

  const { setParams } = useCategoryParams();
  const { filter } = useCategoryFilterParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteCategoryMutation = useMutation(
    trpc.category.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.category.get.queryKey(),
        });
      },
    }),
  );

  const tree = useTree<Category>({
    initialState: {
      expandedItems: [],
    },
    indent,
    rootItemId: rootId,
    onPrimaryAction(item) {
      void setParams({
        categoryId: item.getItemMeta().itemId,
      });
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) =>
      items.some((c) => c.parentId === item.getItemData().id),
    dataLoader: {
      getItem: (itemId) => items.find((c) => c.id === itemId)!,
      getChildren: (itemId) =>
        items.filter((c) => c.parentId === itemId).map((c) => c.id) ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      searchFeature,
      hotkeysCoreFeature,
    ],
  });

  useEffect(() => {
    const prompt = filter.q ?? "";
    tree.setSearch(prompt);
  }, [filter.q, tree]);

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow">
      <div>
        <Tree
          className="relative before:absolute before:inset-0 before:ms-4.5 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
          indent={indent}
          tree={tree}
        >
          {tree.getItems().map((item) => {
            // Merge styles
            const mergedStyle = {
              backgroundColor: `${item.getItemData().color}`,
            } as React.CSSProperties;

            return (
              <div
                key={item.getId()}
                className="flex items-center gap-4 not-last:pb-0.5"
              >
                <TreeItem
                  item={item}
                  className="flex flex-1 items-center not-last:pb-0"
                >
                  <TreeItemLabel className="relative min-w-[250px] py-3 !pl-4 before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background">
                    <span className="flex items-center gap-3">
                      <div className="flex size-4 shrink-0 items-center justify-center">
                        <div
                          style={mergedStyle}
                          className="size-4 rounded-xs"
                        ></div>
                      </div>
                      <DynamicIcon
                        name={
                          (item.getItemData()?.icon as IconName) ??
                          "circle-dashed"
                        }
                        className={cn(
                          "pointer-events-none size-4 text-muted-foreground",
                        )}
                      />
                      <span>{item.getItemName()}</span>
                    </span>
                  </TreeItemLabel>
                  <div
                    className={cn(
                      "relative flex h-[44px] w-full items-center justify-between bg-background pl-4",
                      "before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background",
                    )}
                  >
                    <span className="line-clamp-1 flex-1 text-left text-xs text-muted-foreground">
                      {item.getItemData().description}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVerticalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            void setParams({
                              categoryId: item.getId(),
                            });
                          }}
                        >
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            deleteCategoryMutation.mutate({ id: item.getId() });
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
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
