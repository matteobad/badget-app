"use client";

import type { dynamicIconImports } from "lucide-react/dynamic";
import React, { use, useCallback, useMemo } from "react";
import { DynamicIcon } from "lucide-react/dynamic";

import type { TreeViewItem } from "~/components/tree-view";
import TreeView from "~/components/tree-view";
import { cn } from "~/lib/utils";
import { type DB_BudgetType } from "~/server/db/schema/budgets";
import { CATEGORY_TYPE } from "~/server/db/schema/enum";
import { type getCategoriesWithBudgets_CACHED } from "../server/cached-queries";

type Category = {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  icon: string | null;
  budgets: DB_BudgetType[];
  children: Category[];
};

function mapCategoriesToTreeView(categories: Category[]): TreeViewItem[] {
  return categories.map((cat) => {
    const hasChildren = cat.children.length > 0;

    return {
      id: cat.id,
      name: cat.name,
      type: cat.type,
      icon: hasChildren ? cat.children.length.toString() : cat.icon!, // Necessario per il mapping delle icone
      budgets: cat.budgets,
      children: hasChildren ? mapCategoriesToTreeView(cat.children) : undefined,
    };
  });
}

export function CategoryTreeview({
  promise,
}: {
  promise: Promise<
    [Awaited<ReturnType<typeof getCategoriesWithBudgets_CACHED>>]
  >;
}) {
  const [categories] = use(promise);

  console.log(categories);

  const data = useMemo(() => {
    const categoryMap = new Map<string, Category>(
      categories.map((cat) => [cat.id, { ...cat, children: [] }]),
    );

    const categoryTree: Category[] = [];

    for (const cat of categories) {
      if (!categoryMap.has(cat.id)) continue;

      if (!cat.parentId) {
        categoryTree.push(categoryMap.get(cat.id)!);
      } else {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id)!);
        }
      }
    }

    return mapCategoriesToTreeView(categoryTree).sort((a, b) => {
      const typeOrder = {
        [CATEGORY_TYPE.INCOME]: 0,
        [CATEGORY_TYPE.EXPENSE]: 1,
        [CATEGORY_TYPE.SAVINGS]: 2,
        [CATEGORY_TYPE.INVESTMENT]: 3,
        [CATEGORY_TYPE.TRANSFER]: 4,
      };

      return (
        typeOrder[a.type as keyof typeof typeOrder] -
        typeOrder[b.type as keyof typeof typeOrder]
      );
    });
  }, [categories]);

  const getIcon = useCallback(
    (item: TreeViewItem, _depth: number): React.ReactNode => {
      // Check if item.icon can be parsed as an integer
      if (item.children && item.children.length > 0) {
        return (
          <div
            className={cn(
              "relative flex size-5 items-center justify-center rounded border border-dashed",
              {
                "border-green-800 bg-green-200 text-green-800":
                  item.type === CATEGORY_TYPE.INCOME,
                "border-red-800 bg-red-200 text-red-800":
                  item.type === CATEGORY_TYPE.EXPENSE,
                "border-violet-800 bg-violet-200 text-violet-800":
                  item.type === CATEGORY_TYPE.SAVINGS,
                "border-blue-800 bg-blue-200 text-blue-800":
                  item.type === CATEGORY_TYPE.INVESTMENT,
                "border-neutral-800 bg-neutral-200 text-neutral-800":
                  item.type === CATEGORY_TYPE.TRANSFER,
              },
            )}
          >
            <span className="absolute text-xs font-bold">
              {item.children.length}
            </span>
          </div>
        );
      }

      return (
        <div className="flex size-5 items-center justify-center">
          <DynamicIcon
            name={item.icon as keyof typeof dynamicIconImports}
            className={"size-4"}
          />
        </div>
      );
    },
    [],
  );

  return <TreeView data={data} title="Tree View Demo" getIcon={getIcon} />;
}
