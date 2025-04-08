"use client";

import type { dynamicIconImports } from "lucide-react/dynamic";
import { useCallback, useMemo } from "react";
import { ScaleIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { useQueryStates } from "nuqs";

import type { TreeViewItem } from "~/components/tree-view";
import TreeView from "~/components/tree-view";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";
import { CATEGORY_TYPE } from "~/server/db/schema/enum";
import { categoriesFiltersParsers } from "../utils/search-params";
import { CategoryFilters } from "./category-filters";

export function CategoryTreeview() {
  const [filters] = useQueryStates(categoriesFiltersParsers);
  const [categories] =
    api.category.getCategoriesWithBudgets.useSuspenseQuery(filters);

  const data = useMemo(() => {
    // Array che conterrà le categorie di livello top (senza parent)
    const tree: TreeViewItem[] = [];

    // Mappa per accedere rapidamente a ogni categoria per id
    const categoryMap = new Map<string, TreeViewItem>(
      categories.map((category) => {
        return [
          category.id,
          {
            id: category.id,
            name: category.name,
            type: category.type,
            icon: category.icon ?? "dashed-circle",
            budget: category.budget,
          },
        ];
      }),
    );

    // Costruisci la struttura ad albero: assegna ogni categoria al padre se presente
    categories.forEach((cat) => {
      const currentItem = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parentItem = categoryMap.get(cat.parentId)!;
        parentItem.children = [...(parentItem.children ?? []), currentItem];
      } else {
        // Se non ha parentId, è un nodo di livello top
        tree.push(currentItem);
      }
    });

    return tree.sort((a, b) => {
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

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Categorie</CardTitle>
        <CategoryFilters />
      </CardHeader>
      <CardContent>
        <TreeView data={data} getIcon={getIcon}></TreeView>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">
          <ScaleIcon /> Ridistribuisci
        </Button>
        <div className="flex items-center text-muted-foreground">
          <span className="font-mono text-primary">250 €</span>
          <span className="w-[86px] text-right">rimanenti</span>
        </div>
      </CardFooter>
    </Card>
  );

  // return <TreeView data={data} title="Tree View Demo" getIcon={getIcon} />;
}

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
