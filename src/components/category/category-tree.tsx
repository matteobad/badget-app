"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { IconName } from "lucide-react/dynamic";
import { useState } from "react";
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
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useI18n } from "~/shared/locales/client";
import { formatPerc } from "~/utils/format";
import { DotIcon, PlusIcon, RepeatIcon, SearchIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

import type { FeatureImplementation, TreeState } from "@headless-tree/core";
import { CurrencyInput } from "../custom/currency-input";
import { Tree, TreeItem, TreeItemLabel } from "../tree";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CategoryActions } from "./category-actions";
import { CategoryFilters } from "./category-filters";

type Category = RouterOutput["category"]["getFlatTree"][number];

const indent = 24;

export function CategoryTree() {
  const t = useI18n();

  const { params, setParams } = useCategoryParams();
  const { filter: categoryFilters } = useCategoryFilterParams();
  const { filter: budgetFilters } = useBudgetFilterParams();

  const trpc = useTRPC();

  const { data: items } = useSuspenseQuery(
    trpc.category.getFlatTree.queryOptions({
      categoryFilters,
      budgetFilters,
    }),
  );

  const { data: warnings } = useSuspenseQuery(
    trpc.budget.getBudgetWarnings.queryOptions({
      categoryFilters: {},
      budgetFilters,
    }),
  );

  const doubleClickExpandFeature: FeatureImplementation = {
    itemInstance: {
      getProps: ({ tree, item, prev }) => ({
        ...prev?.(),
        onDoubleClick: (_e: React.MouseEvent) => {
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
        onClick: (e: React.MouseEvent) => {
          if (e.shiftKey) {
            item.selectUpTo(e.ctrlKey || e.metaKey);
          } else if (e.ctrlKey || e.metaKey) {
            item.toggleSelect();
          } else {
            tree.setSelectedItems([item.getItemMeta().itemId]);
          }

          item.setFocused();
          console.log(e.target);
          // void setParams({ categoryId: item.getItemMeta().itemId });
        },
      }),
    },
  };

  // Store the initial expanded items to reset when search is cleared
  const initialExpandedItems = Object.values(items)
    .filter((item) => item.children)
    .map((item) => item.id);
  const [state, setState] = useState<Partial<TreeState<Category>>>({});

  const tree = useTree<Category>({
    state,
    setState,
    initialState: {
      expandedItems: initialExpandedItems,
      selectedItems: params.categoryId ? [params.categoryId] : [],
    },
    indent,
    rootItemId: "root_id",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => items[itemId]!,
      getChildren: (itemId) => items[itemId]?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      selectionFeature,
      searchFeature,
      expandAllFeature,
      doubleClickExpandFeature,
    ],
  });

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex justify-between">
        <div className="relative mb-2 flex gap-4">
          <Input
            className="peer ps-9"
            {...{
              ...tree.getSearchInputElementProps(),
              onChange: (e) => {
                // First call the original onChange handler from getSearchInputElementProps
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const originalProps = tree.getSearchInputElementProps();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (originalProps.onChange) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                  originalProps.onChange(e);
                }

                // Then handle our custom logic
                const value = e.target.value;

                if (value.length > 0) {
                  // If input has at least one character, expand all items
                  void tree.expandAll();
                } else {
                  // If input is cleared, reset to initial expanded state
                  setState((prevState) => {
                    return {
                      ...prevState,
                      expandedItems: initialExpandedItems,
                    };
                  });
                }
              },
            }}
            type="search"
            placeholder="Quick search..."
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <SearchIcon className="size-4" aria-hidden="true" />
          </div>
        </div>

        <CategoryActions />
      </div>

      <div className="flex items-center text-sm text-muted-foreground">
        <span className="flex flex-1 items-center gap-2">
          {t("categories", { count: Object.entries(items).length })}
        </span>
        <CategoryFilters />
        <span className="w-[170px] text-right">{t("category.budget")}</span>
      </div>

      <Tree
        className="relative -ml-1 before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
        indent={indent}
        tree={tree}
      >
        {/* <AssistiveTreeDescription tree={tree} /> */}
        {tree.getItems().map((item) => {
          // Merge styles
          const mergedStyle = {
            color: `${item.getItemData().color}`,
          } as React.CSSProperties;

          const {} = item;

          return (
            <TreeItem key={item.getId()} item={item} asChild>
              <div className="flex w-full justify-between">
                <TreeItemLabel className="group relative w-full gap-2 not-in-data-[folder=true]:ps-2 before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background">
                  <span className="line-clamp-1 flex flex-1 items-center gap-2 text-ellipsis md:max-w-none">
                    {!item.isFolder() && (
                      <DotIcon style={mergedStyle} className={cn("size-4")} />
                    )}

                    <DynamicIcon
                      name={
                        (item.getItemData()?.icon as IconName) ??
                        "circle-dashed"
                      }
                      className={cn(
                        "pointer-events-none size-4 text-muted-foreground",
                      )}
                    />
                    <span className="text-base">{item.getItemName()}</span>
                    {!item.getItemData().parentId && (
                      <Badge variant="tag-rounded">System</Badge>
                    )}
                  </span>
                </TreeItemLabel>
                <div
                  className={cn(
                    "relative flex h-full min-w-[248px] items-center justify-end bg-background px-2",
                    "before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background",
                  )}
                >
                  <CategoryBudget category={item.getItemData()} />
                </div>

                <div
                  className={cn(
                    "relative flex h-full min-w-[170px] items-center justify-end bg-background",
                    "before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background",
                    "after:absolute after:left-0 after:z-10 after:h-10 after:w-[1px] after:bg-muted",
                  )}
                >
                  <CategoryTotal category={item.getItemData()} />
                  <CategoryPercentage category={item.getItemData()} />
                </div>
              </div>
            </TreeItem>
          );
        })}
      </Tree>
    </div>
  );
}

function CategoryBudget({ category }: { category: Category }) {
  const budget = category.budgets[0];

  if (!budget) {
    return (
      <Button size="icon" variant="ghost" className="mr-18 size-8">
        <PlusIcon className="text-muted-foreground" />
      </Button>
    );
  }

  return (
    <div className="group relative flex w-[280px] items-center justify-start gap-3 font-mono text-muted-foreground">
      <CurrencyInput
        decimalScale={0}
        className="h-9 w-40 border text-right text-sm font-normal transition-all not-group-hover:border-background not-group-hover:shadow-none"
        value={budget.amount}
        onBlur={() => console.log("mutate budget")}
      />
      <Badge
        variant="tag"
        className="absolute top-1.5 left-2 aspect-square size-6 rounded capitalize"
      >
        {budget.period.charAt(0)}
      </Badge>
      <Badge
        variant="tag"
        className="absolute top-1.5 left-9 size-6 rounded capitalize"
      >
        <RepeatIcon className="size-4" />
      </Badge>
      <Badge variant="tag">{category.budgets.length}</Badge>
    </div>
  );
}

function CategoryTotal({ category }: { category: Category }) {
  return (
    <div className="flex w-[120px] items-center justify-end gap-1 font-mono text-sm text-muted-foreground">
      <span>
        {formatAmount({
          amount: category.categoryBudget ?? category.childrenBudget,
          currency: "eur",
          maximumFractionDigits: 0,
        })}
      </span>
    </div>
  );
}

function CategoryPercentage({ category }: { category: Category }) {
  return (
    <div className="flex w-[50px] items-center justify-end gap-1 font-mono text-neutral-300">
      <span className="text-xs">{formatPerc(category.perc)}</span>
    </div>
  );
}
