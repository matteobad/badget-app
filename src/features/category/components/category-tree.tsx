"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { TreeNode } from "~/shared/types";
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
    <div {...props} className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex-1">Abbiamo notato 1 problema nel budget</span>

        <div className="flex items-center justify-end px-2 text-right">
          <span className="w-[120px]">Budget</span>
          <span className="w-[120px]">Totale</span>
          <span className="w-10">%</span>
          <span className="w-10"></span>
        </div>
      </div>
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
            <SidebarMenuButton className="mr-0 flex w-full items-center justify-between gap-2 [&[data-state=open]>div>svg:first-child]:rotate-90">
              <div className="flex items-center gap-2">
                <ChevronRightIcon
                  className={cn(
                    categoryListColors,
                    "size-4 transition-transform",
                  )}
                />
                <CategoryIcon item={item} />
                <span className="truncate text-primary">{category.name}</span>
              </div>
              <div className="flex items-center justify-end">
                <CategoryBudgets budgets={category.budgets} />
                <CategoryTotal category={category} />
                <CategoryPercentage category={category} />
                <CategoryActions category={category} />
              </div>
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
        <SidebarMenuButton className="flex w-full items-center justify-between gap-2 pr-[9px] pl-1">
          <div className="flex items-center gap-2">
            <DotIcon className={cn(categoryListColors, "size-6")} />
            <CategoryIcon item={item} />
            <span className="truncate text-primary">{category.name}</span>
          </div>
          <div className="flex items-center justify-end">
            <CategoryBudgets budgets={category.budgets} />
            <CategoryTotal category={category} />
            <CategoryPercentage category={category} />
            <CategoryActions category={category} />
          </div>
        </SidebarMenuButton>
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
          amount: parseFloat(budget.amount),
          maximumFractionDigits: 0,
        })}
      </span>
      <span className="flex size-4 items-center justify-center rounded border border-neutral-300 text-[10px] uppercase">
        {budget.period.charAt(0)}
      </span>
    </div>
  );
}

function CategoryTotal({}: { category: Category }) {
  return (
    <div className="flex w-[120px] items-center justify-end gap-1 font-mono text-muted-foreground">
      <span className="">
        {formatAmount({
          amount: parseFloat("0"),
          maximumFractionDigits: 0,
        })}
      </span>
    </div>
  );
}

function CategoryPercentage({}: { category: Category }) {
  return (
    <div className="flex w-10 items-center justify-end gap-1 font-mono text-neutral-300">
      <span className="">{formatPerc(0)}</span>
    </div>
  );
}

function CategoryActions({}: { category: Category }) {
  return (
    <div className="flex w-10 justify-end text-primary">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <EllipsisVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <RefreshCwIcon className="size-3" />
            Modifica
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <UnlinkIcon className="size-3" />
            Elimina
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
