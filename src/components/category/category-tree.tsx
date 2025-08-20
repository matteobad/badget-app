"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
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

import { CategoryBadge } from "./category-badge";

type Category = RouterOutput["category"]["get"][number];

const ROOT_CATEGORY: Category = {
  id: "root",
  slug: "root",
  name: "root",
  description: "root",
  parentId: null,
  color: null,
  icon: null,
  type: "transfer",
  excludeFromAnalytics: false,
};

const indent = 20;

type CategoryTreeProps = {
  items: Category[];
  rootId?: string;
};

export function CategoryTree(props: CategoryTreeProps) {
  const { items } = props;

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

  const data: Category[] = [
    ...items.map((item) => {
      return {
        ...item,
        parentId: item.parentId ?? "root",
      };
    }),
    ROOT_CATEGORY,
  ];

  const tree = useTree<Category>({
    initialState: {
      expandedItems: [],
    },
    indent,
    rootItemId: "root",
    // onPrimaryAction(item) {
    //   void setParams({
    //     categoryId: item.getItemMeta().itemId,
    //   });
    // },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) =>
      data.some((c) => c.parentId === item.getItemData().id),
    dataLoader: {
      getItem: (itemId) => data.find((c) => c.id === itemId)!,
      getChildren: (itemId) =>
        data.filter((c) => c.parentId === itemId).map((c) => c.id) ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      searchFeature,
      hotkeysCoreFeature,
    ],
  });

  console.log(
    props,
    props.rootId,
    props.items.find((c) => c.id === props.rootId),
  );

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
            return (
              <div
                key={item.getId()}
                className="flex items-center gap-4 not-last:pb-0.5"
              >
                <TreeItem
                  item={item}
                  className="flex flex-1 items-center not-last:pb-0"
                >
                  <TreeItemLabel className="relative min-w-[250px] py-2 before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background hover:bg-transparent in-data-[selected=true]:bg-transparent">
                    <span className="flex items-center gap-3">
                      <CategoryBadge category={item.getItemData()} />
                    </span>
                  </TreeItemLabel>
                  <div
                    className={cn(
                      "relative flex h-[44px] w-full items-center justify-between bg-background pl-4",
                      "before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background",
                    )}
                  >
                    <span className="line-clamp-1 flex-1 text-left text-sm text-muted-foreground">
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
