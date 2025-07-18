"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { IconName } from "lucide-react/dynamic";
import { useEffect, useState } from "react";
import {
  expandAllFeature,
  hotkeysCoreFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import { useCategoryFilterParams } from "~/hooks/use-category-filter-params";
import { useCategoryParams } from "~/hooks/use-category-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { DynamicIcon } from "lucide-react/dynamic";

import type { FeatureImplementation, TreeState } from "@headless-tree/core";
import { Tree, TreeItem, TreeItemLabel } from "../tree";
import { Badge } from "../ui/badge";

type CategoryWithAccrual = RouterOutput["category"]["getWithBudgets"][number];

const indent = 36;
// const cancelToken = { current: false };

export function CategoryTree() {
  const { params, setParams } = useCategoryParams();
  const { filter: categoryFilters } = useCategoryFilterParams();
  const { filter: budgetFilters } = useBudgetFilterParams();

  const trpc = useTRPC();

  const { data: items } = useSuspenseQuery(
    trpc.category.getWithBudgets.queryOptions({
      ...categoryFilters,
      ...budgetFilters,
    }),
  );

  // const { data: warnings } = useSuspenseQuery(
  //   trpc.budget.getBudgetWarnings.queryOptions({
  //     categoryFilters: {},
  //     budgetFilters,
  //   }),
  // );

  // Store the initial expanded items to reset when search is cleared
  const initialExpandedItems = Object.values(items).map(
    (item) => item.category.id,
  );
  const [state, setState] = useState<Partial<TreeState<CategoryWithAccrual>>>(
    {},
  );

  let clickTimeout: NodeJS.Timeout | null = null;

  const customClickBehavior: FeatureImplementation = {
    itemInstance: {
      getProps: ({ tree, item, prev }) => ({
        ...prev?.(),
        onDoubleClick: (_e: MouseEvent) => {
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }
          item.primaryAction();

          if (!item.isFolder()) {
            return;
          }

          if (item.isExpanded()) {
            item.collapse();
          } else {
            item.expand();
          }
        },
        onClick: (e: MouseEvent) => {
          if (clickTimeout) clearTimeout(clickTimeout);

          clickTimeout = setTimeout(() => {
            if (e.shiftKey) {
              item.selectUpTo(e.ctrlKey || e.metaKey);
            } else if (e.ctrlKey || e.metaKey) {
              item.toggleSelect();
            } else {
              tree.setSelectedItems([item.getItemMeta().itemId]);
            }

            item.setFocused();
            void setParams({ categoryId: item.getId() });
            clickTimeout = null;
          }, 250); // Ritardo che distingue un click da un double click
        },
      }),
    },
  };

  const tree = useTree<CategoryWithAccrual>({
    state,
    setState,
    initialState: {
      expandedItems: initialExpandedItems,
      selectedItems: params.categoryId ? [params.categoryId] : [],
    },
    indent,
    rootItemId: "root",
    getItemName: (item) => item.getItemData().category.name,
    isItemFolder: (item) =>
      items.some(
        (data) => data.category.parentId === item.getItemData().category.id,
      ),
    dataLoader: {
      getItem: (itemId) => items.find((item) => item.category.id === itemId)!,
      getChildren: (itemId) =>
        items
          .filter((item) => item.category.parentId === itemId)
          .map((item) => item.category.id),
    },
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      selectionFeature,
      searchFeature,
      expandAllFeature,
      customClickBehavior,
    ],
  });

  useEffect(() => {
    const prompt = categoryFilters.q ?? "";
    tree.setSearch(prompt);
  }, [categoryFilters.q, tree]);

  return (
    <div className="w-full">
      <div className="scrollbar-hide overflow-x-auto overscroll-x-none border-y border-border p-4">
        <Tree
          className="relative -ml-1 before:absolute before:inset-0 before:-ms-4 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
          indent={indent}
          tree={tree}
        >
          {tree.getItems().map((item) => {
            // Merge styles
            const mergedStyle = {
              backgroundColor: `${item.getItemData().category.color}`,
            } as React.CSSProperties;

            return (
              <TreeItem key={item.getId()} item={item} asChild>
                <div className="flex w-full items-center justify-between">
                  {/* Category color, icon and name  */}
                  <TreeItemLabel className="group relative w-full not-in-data-[folder=true]:ps-2 before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background">
                    <span className="line-clamp-1 flex flex-1 items-center gap-2 text-ellipsis md:max-w-none">
                      {item.getItemData().category.parentId !== null && (
                        <div className="flex size-6 shrink-0 items-center justify-center">
                          <div
                            style={mergedStyle}
                            className="size-4 rounded-xs"
                          ></div>
                        </div>
                      )}

                      <div className="flex size-6 shrink-0 items-center justify-center">
                        <DynamicIcon
                          name={
                            (item.getItemData().category?.icon as IconName) ??
                            "circle-dashed"
                          }
                          className={cn(
                            "pointer-events-none size-5 text-muted-foreground",
                          )}
                        />
                      </div>
                      <span className="">{item.getItemName()}</span>
                      {!item.getItemData().category.parentId && (
                        <Badge variant="tag-rounded">system</Badge>
                      )}
                    </span>
                  </TreeItemLabel>
                  {/* Category budget edits  */}
                  {/* <div
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    className={cn(
                      "relative flex h-full min-w-[266px] items-center justify-end bg-background px-4",
                      "before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background",
                    )}
                  >
                    <CategoryBudget
                      categoryId={item.getItemData().category.id}
                    />
                  </div> */}
                  {/* Category budget details and recap  */}
                  {/* <div
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    className={cn(
                      "relative flex h-full min-w-40 items-center justify-end bg-background",
                      "before:absolute before:inset-x-0 before:-z-10 before:h-12 before:bg-background",
                      "after:absolute after:left-0 after:z-10 after:h-18 after:w-[1px] after:bg-muted",
                    )}
                  >
                    <CategoryTotal data={item.getItemData()} />
                    <CategoryPercentage data={item.getItemData()} />
                  </div> */}
                </div>
              </TreeItem>
            );
          })}
        </Tree>
      </div>
    </div>
  );
}

// function CategoryTotal({ data }: { data: CategoryWithAccrual }) {
//   const styles = getBudgetTotalColor(
//     data.category.type,
//     !data.category.parentId,
//   );
//   return (
//     <div
//       className={cn(
//         "flex w-[120px] items-center justify-end gap-1 font-mono text-sm text-muted-foreground",
//         styles,
//       )}
//     >
//       <span>
//         {formatAmount({
//           amount: data.accrualAmount ?? data.childrenAccrualAmount,
//           currency: "eur",
//           maximumFractionDigits: 0,
//         })}
//       </span>
//     </div>
//   );
// }

// function CategoryPercentage({ data }: { data: CategoryWithAccrual }) {
//   return (
//     <div className="flex w-[50px] items-center justify-end gap-1 font-mono text-neutral-300">
//       <span className="text-xs">{formatPerc(data.incomePercentage ?? 0)}</span>
//     </div>
//   );
// }
