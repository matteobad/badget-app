"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { TreeNode } from "~/shared/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuSub } from "~/components/ui/sidebar";
import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import { useCategoryFilterParams } from "~/hooks/use-category-filter-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { ChevronRightIcon, DotIcon } from "lucide-react";

import { getCategoryListColors } from "../utils";
import { CategoryIcon } from "./category-icon";

type Category = RouterOutput["category"]["getCategoryTree"][number][0];

type CategoryTreeNode = TreeNode<Category>;

export function CategoryTree({ ...props }: React.ComponentProps<"div">) {
  const { filter: categoryFilters } = useCategoryFilterParams();
  const { filter: budgetFilters } = useBudgetFilterParams();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.category.getCategoryTree.queryOptions({
      categoryFilters,
      budgetFilters,
    }),
  );

  // data is TreeNode<Category>[]
  return (
    <div {...props}>
      {data?.map((item) => <Tree key={item[0].id} item={item} />)}
    </div>
  );
}

function Tree({ item }: { item: CategoryTreeNode }) {
  const [category, children] = item;
  const hasChildren = children.length > 0;
  const categoryListColors = getCategoryListColors(item[0].type);

  return (
    <div className="w-full">
      {hasChildren ? (
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="mr-0 flex w-full items-center gap-2 [&[data-state=open]>svg]:rotate-90">
              <ChevronRightIcon
                className={cn(
                  categoryListColors,
                  "size-4 transition-transform",
                )}
              />
              <CategoryIcon item={item} />
              <span className="truncate">{category.name}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className={cn(categoryListColors, "mr-0 pr-0")}>
              {children.map((child) => (
                <Tree key={child[0].id} item={child} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <SidebarMenuButton className="flex w-full items-center gap-2">
          <DotIcon />
          <CategoryIcon item={item} />
          <span className="truncate text-primary">{category.name}</span>
        </SidebarMenuButton>
      )}
    </div>
  );
}
