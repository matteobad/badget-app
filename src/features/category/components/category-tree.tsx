"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { TreeNode } from "~/shared/types";
import type { dynamicIconImports } from "lucide-react/dynamic";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuSub } from "~/components/ui/sidebar";
import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import { useCategoryFilterParams } from "~/hooks/use-category-filter-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { formatAmount, formatPerc } from "~/utils/format";
import {
  ChevronRightIcon,
  DotIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  RefreshCwIcon,
  UnlinkIcon,
} from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

import { getBudgetTotalColor, getCategoryListColors } from "../utils";

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
    <div {...props} className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex-1">Abbiamo notato 1 problema nel budget</span>

        <div className="flex items-center justify-end px-2 text-right">
          <span className="w-[120px]">Budget</span>
          <span className="w-[120px]">Totale</span>
          <span className="w-[50px]">%</span>
          {/* <span className="w-12"></span> */}
        </div>
      </div>
      {data?.map((item) => <Tree key={item[0].id} item={item} />)}
    </div>
  );
}

function Tree({ item, depth = 0 }: { item: CategoryTreeNode; depth?: number }) {
  const [category, children] = item;
  const hasChildren = children.length > 0;
  const categoryListColors = getCategoryListColors(item[0].type);

  return (
    <div className="w-full">
      {hasChildren ? (
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <div
              className={cn(
                "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
                "mr-0 flex w-full items-center justify-between gap-2 [&[data-state=open]>div>svg:first-child]:rotate-90",
              )}
              style={{ border: depth + "px solid transparent" }}
            >
              <div className="flex items-center gap-2">
                {hasChildren ? (
                  <ChevronRightIcon
                    className={cn(
                      categoryListColors,
                      "mr-1 ml-1 size-4 transition-transform",
                    )}
                  />
                ) : (
                  <DotIcon className={cn(categoryListColors, "size-6")} />
                )}
                <DynamicIcon
                  name={category.icon as keyof typeof dynamicIconImports}
                  className={cn("size-5 text-primary")}
                />
                <span className="truncate text-primary">{category.name}</span>
              </div>
              <div className="flex items-center justify-end">
                <CategoryBudgets budgets={category.budgets} />
                <CategoryTotal category={category} />
                <CategoryPercentage category={category} />
                {/* <CategoryActions category={category} /> */}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div
              className={cn(
                "mx-4.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
                "group-data-[collapsible=icon]:hidden",
                categoryListColors,
                "mr-0 pr-0",
              )}
            >
              {children.map((child) => (
                <Tree key={child[0].id} item={child} depth={depth + 1} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div
          style={{ border: depth + "px solid transparent" }}
          className={cn(
            "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
            "mr-0 flex w-full items-center justify-between gap-2 [&[data-state=open]>div>svg:first-child]:rotate-90",
          )}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <ChevronRightIcon
                className={cn(
                  categoryListColors,
                  "mr-1 size-4 transition-transform",
                )}
              />
            ) : (
              <DotIcon className={cn(categoryListColors, "size-6")} />
            )}
            <DynamicIcon
              name={category.icon as keyof typeof dynamicIconImports}
              className={cn("size-5 text-primary")}
            />
            <span className="truncate text-primary">{category.name}</span>
          </div>
          <div className="flex items-center justify-end">
            <CategoryBudgets budgets={category.budgets} />
            <CategoryTotal category={category} />
            <CategoryPercentage category={category} />
            {/* <CategoryActions category={category} /> */}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryBudgets({ budgets }: { budgets: Category["budgets"] }) {
  const budget = budgets[0];

  if (!budget) {
    return (
      <Button variant={"ghost"} className="-mr-[3px] size-6 text-neutral-300">
        <PlusIcon className="size-4 text-neutral-300" />
      </Button>
    );
  }

  return (
    <div className="flex w-[120px] items-center justify-end gap-2 font-mono text-neutral-300">
      <span className="">
        {formatAmount({
          amount: budget.amount,
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
  const categoryListColors = getBudgetTotalColor(category.type, true);

  return (
    <div className="flex w-[120px] items-center justify-end gap-1 font-mono text-muted-foreground">
      <span className={cn(categoryListColors)}>
        {formatAmount({
          amount: category.categoryBudget ?? category.childrenBudget,
          maximumFractionDigits: 0,
        })}
      </span>
    </div>
  );
}

function CategoryPercentage({}: { category: Category }) {
  return (
    <div className="flex w-[50px] items-center justify-end gap-1 font-mono text-neutral-300">
      <span className="text-xs">{formatPerc(1)}</span>
    </div>
  );
}
