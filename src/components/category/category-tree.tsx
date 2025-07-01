"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { dynamicIconImports } from "lucide-react/dynamic";
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
import { Button } from "~/components/ui/button";
import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import { useCategoryFilterParams } from "~/hooks/use-category-filter-params";
import { cn } from "~/lib/utils";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useI18n, useScopedI18n } from "~/shared/locales/client";
import { formatPerc } from "~/utils/format";
import { DotIcon, PlusIcon, SearchIcon, TriangleAlertIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

import type { FeatureImplementation, TreeState } from "@headless-tree/core";
import { Tree, TreeItem, TreeItemLabel } from "../tree";
import { Input } from "../ui/input";
import { CategoryFilters } from "./category-filters";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import UpdateCategoryDialog from "./update-category-dialog";

type Category = RouterOutput["category"]["getFlatTree"][number];

const indent = 24;

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
      },
    }),
  },
};

export function CategoryTree() {
  const t = useI18n();
  const tScoped = useScopedI18n("categories.budget");

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

  // Store the initial expanded items to reset when search is cleared
  const initialExpandedItems = Object.values(items)
    .filter((item) => item.children)
    .map((item) => item.id);
  const [state, setState] = useState<Partial<TreeState<Category>>>({});

  console.log(items);

  const tree = useTree<Category>({
    state,
    setState,
    initialState: {
      expandedItems: initialExpandedItems,
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
    <div className="flex flex-col gap-2">
      <div className="flex h-full flex-col gap-2 *:nth-2:grow">
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
          <CategoryFilters />
        </div>
        <div className="mb-2 flex w-full items-center justify-center gap-2 rounded border border-yellow-600 bg-yellow-50 px-4 py-2 text-yellow-600">
          {tScoped("warning", { count: warnings.length })}
          {warnings.length > 0 && <TriangleAlertIcon className="size-4" />}
        </div>
        <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
          <span className="flex flex-1 items-center gap-2">
            {t("categories", { count: Object.entries(items).length })}
          </span>

          <div className="flex items-center justify-end px-2 text-right">
            <span className="w-full">Budget</span>
            <span className="w-[120px] shrink-0">Totale</span>
            <span className="w-[50px] shrink-0">%</span>
          </div>
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

            return (
              <TreeItem key={item.getId()} item={item}>
                <TreeItemLabel className="group relative gap-2 not-in-data-[folder=true]:ps-2 before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background">
                  <span className="line-clamp-1 flex max-w-[100px] items-center gap-2 text-ellipsis md:max-w-none">
                    {!item.isFolder() && (
                      <DotIcon style={mergedStyle} className={cn("size-4")} />
                    )}

                    <DynamicIcon
                      name={
                        item.getItemData()
                          .icon as keyof typeof dynamicIconImports
                      }
                      className={cn(
                        "pointer-events-none size-4 text-muted-foreground",
                      )}
                    />
                    {item.getItemName()}
                  </span>
                  <div className="flex flex-1 items-center justify-end">
                    {item.getItemData().parentId !== null && (
                      <CategoryActions category={item.getItemData()} />
                    )}

                    <CategoryBudgets
                      category={item.getItemData()}
                      warnings={warnings}
                    />
                    <CategoryTotal category={item.getItemData()} />
                    <CategoryPercentage category={item.getItemData()} />
                  </div>
                </TreeItemLabel>
              </TreeItem>
            );
          })}
        </Tree>
      </div>
    </div>
  );
}

function CategoryBudgets({
  category,
  warnings,
}: {
  category: Category;
  warnings: RouterOutput["budget"]["getBudgetWarnings"];
}) {
  const t = useI18n();
  const budget = category.budgets[0];
  const warning = warnings.find((w) => w.parentId === category.id);

  if (!budget) {
    return (
      <Button variant={"ghost"} className="-mr-[3px] size-6 text-neutral-300">
        <PlusIcon className="size-4 text-neutral-300" />
      </Button>
    );
  }

  return (
    <div className="flex grow items-center justify-end gap-2 font-mono text-neutral-300">
      {warning && (
        <span className="mr-2 truncate text-xs">
          {t("categories.budget.warning.node")}
        </span>
      )}
      <span className="">
        {formatAmount({
          amount: budget.amount,
          currency: "eur",
          maximumFractionDigits: 0,
        })}
      </span>
      <span className="flex size-4 items-center justify-center rounded border border-neutral-300 text-[10px] uppercase">
        {budget.period.charAt(0)}
      </span>
    </div>
  );
}

function CategoryTotal({ category }: { category: Category }) {
  return (
    <div className="flex w-[120px] items-center justify-end gap-1 font-mono text-muted-foreground">
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

function CategoryActions({ category }: { category: Category }) {
  return (
    <div className="ml-4 hidden justify-end gap-3 text-primary group-hover:flex">
      <UpdateCategoryDialog categoryId={category.id} />
      <DeleteCategoryDialog categoryId={category.id} />
    </div>
  );
}
