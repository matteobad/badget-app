"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { TreeNode } from "~/shared/types";
import type { dynamicIconImports } from "lucide-react/dynamic";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuSub } from "~/components/ui/sidebar";
import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import { useCategoryFilterParams } from "~/hooks/use-category-filter-params";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { ChevronRightIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

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

  // Optionally, you can use category.icon if available for a dynamic icon
  const Icon = () => (
    <DynamicIcon
      name={category.icon as keyof typeof dynamicIconImports}
      className={"size-4"}
    />
  );

  return (
    <div className="w-full">
      {hasChildren ? (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="flex w-full items-center gap-2">
              <ChevronRightIcon className="size-4 transition-transform data-[state=open]:rotate-90" />
              <Icon />
              <span className="truncate">{category.name}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {children.map((child) => (
                <Tree key={child[0].id} item={child} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <SidebarMenuButton className="flex w-full items-center gap-2 pl-8">
          <Icon />
          <span className="truncate">{category.name}</span>
        </SidebarMenuButton>
      )}
    </div>
  );
}
