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
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { getBudgetTotalColor } from "~/features/category/utils";
import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import { useCategoryFilterParams } from "~/hooks/use-category-filter-params";
import { useCategoryParams } from "~/hooks/use-category-params";
import { cn } from "~/lib/utils";
import { formatAmount } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useI18n } from "~/shared/locales/client";
import { formatPerc } from "~/utils/format";
import { DotIcon, InfoIcon, PlusIcon, SearchIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { toast } from "sonner";

import type { TreeState } from "@headless-tree/core";
import BudgetInput from "../budget/forms/budget-input";
import { Tree, TreeItem, TreeItemChevron, TreeItemLabel } from "../tree";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CategoryActions } from "./category-actions";
import { CategoryFilters } from "./category-filters";

type CategoryWithAccrual = RouterOutput["category"]["getWithBudgets"][number];

const indent = 36;
// const cancelToken = { current: false };

export function CategoryTree() {
  const t = useI18n();

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
    ],
  });

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center text-sm text-muted-foreground">
        <div className="relative flex flex-1 items-center gap-4">
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
          <CategoryActions />
        </div>
        <CategoryFilters />
        <span className="w-40 text-right">{t("category.budget")}</span>
      </div>

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

          const isFolder = item.isFolder();

          return (
            <TreeItem key={item.getId()} item={item} asChild>
              <div className="flex w-full justify-between">
                {/* Chevron button for expand/collapse */}
                {isFolder || item.getItemData().category.parentId === "root" ? (
                  <TreeItemChevron />
                ) : (
                  <div className="relative flex size-10 shrink-0 items-center justify-center bg-background">
                    <DotIcon className="size-5" />
                    {/* <div className="absolute right-0 bottom-4.5 w-1/2 border-b"></div> */}
                  </div>
                )}
                {/* Category color, icon and name  */}
                <TreeItemLabel
                  className="group relative w-full px-1.5! not-in-data-[folder=true]:ps-2 before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void setParams({ categoryId: item.getId() });
                  }}
                >
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
                <div
                  className={cn(
                    "relative flex h-full min-w-[266px] items-center justify-end bg-background px-4",
                    "before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background",
                  )}
                >
                  <CategoryBudget data={item.getItemData()} />
                </div>
                {/* Category budget details and recap  */}
                <div
                  className={cn(
                    "relative flex h-full min-w-40 items-center justify-end bg-background",
                    "before:absolute before:inset-x-0 before:-z-10 before:h-12 before:bg-background",
                    "after:absolute after:left-0 after:z-10 after:h-12 after:w-[1px] after:bg-muted",
                  )}
                >
                  <CategoryTotal data={item.getItemData()} />
                  <CategoryPercentage data={item.getItemData()} />
                </div>
              </div>
            </TreeItem>
          );
        })}
      </Tree>
    </div>
  );
}

function CategoryBudget({ data }: { data: CategoryWithAccrual }) {
  const [amount, setAmount] = useState(data.budgetInstances[0]?.amount);

  const trpc = useTRPC();
  const updateBudgetMutation = useMutation(
    trpc.budget.update.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const budget = data.budgetInstances[0];

  if (!budget) {
    return (
      <Button size="icon" variant="ghost" className="mr-18 size-8">
        <PlusIcon className="text-muted-foreground" />
      </Button>
    );
  }

  return (
    <div className="group relative flex w-[240px] shrink-0 items-center justify-start gap-2 font-mono text-muted-foreground">
      <BudgetInput
        key={budget.originalBudgetId}
        value={budget.amount}
        recurrence={budget.recurrence}
        isRecurring={!!budget.recurrence}
        onValueChange={console.log}
        onOverride={console.log}
        onPermanentChange={console.log}
        className="w-full"
      />
    </div>
  );
}

function CategoryTotal({ data }: { data: CategoryWithAccrual }) {
  const styles = getBudgetTotalColor(
    data.category.type,
    !data.category.parentId,
  );
  return (
    <div
      className={cn(
        "flex w-[120px] items-center justify-end gap-1 font-mono text-sm text-muted-foreground",
        styles,
      )}
    >
      <span>
        {formatAmount({
          amount: data.accrualAmount ?? data.childrenAccrualAmount,
          currency: "eur",
          maximumFractionDigits: 0,
        })}
      </span>
    </div>
  );
}

function CategoryPercentage({ data }: { data: CategoryWithAccrual }) {
  return (
    <div className="flex w-[50px] items-center justify-end gap-1 font-mono text-neutral-300">
      <span className="text-xs">{formatPerc(data.incomePercentage ?? 0)}</span>
    </div>
  );
}
