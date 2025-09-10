"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { useI18n } from "~/shared/locales/client";
import {
  ChevronDown,
  ChevronRight,
  GitBranchPlus,
  MoreHorizontalIcon,
  SquarePenIcon,
  TrashIcon,
} from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";
import { CategoryBadge } from "../category-badge";

export type Category = RouterOutput["transactionCategory"]["get"][number];

// Component to display category description from localization
function CategoryTooltip({ category }: { category: any }) {
  const t = useI18n();

  // Priority 1: User-defined description
  if (category.description) {
    return <span>{category.description}</span>;
  }

  // Priority 2: System description from localization
  try {
    return (
      // @ts-expect-error - slug is not nullable
      <span>{t(`transaction_categories.${category.slug}`)}</span>
    );
  } catch {
    // Fallback if translation not found
    return <span>Category description not available</span>;
  }
}

// Flatten categories to include both parents and children with hierarchy info
export function flattenCategories(categories: any[]): any[] {
  const flattened: any[] = [];

  for (const category of categories) {
    // Add parent category
    flattened.push({
      ...category,
      isChild: false,
      hasChildren: category.children && category.children.length > 0,
    });

    // Add children if they exist
    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        flattened.push({
          ...child,
          isChild: true,
          parentId: category.id,
          hasChildren: false,
        });
      }
    }
  }

  return flattened;
}

export const columns: ColumnDef<any>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row, table }) => {
      const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(),
      );

      // Get expanded state from table meta or use local state as fallback
      const tableExpandedCategories =
        (table.options.meta as any)?.expandedCategories || expandedCategories;
      const setTableExpandedCategories =
        (table.options.meta as any)?.setExpandedCategories ||
        setExpandedCategories;

      const isExpanded = tableExpandedCategories.has(row.original.id);
      const hasChildren = row.original.hasChildren;
      const isChild = row.original.isChild;

      const toggleExpanded = () => {
        const newExpanded = new Set(tableExpandedCategories);
        if (isExpanded) {
          newExpanded.delete(row.original.id);
        } else {
          newExpanded.add(row.original.id);
        }
        setTableExpandedCategories(newExpanded);
      };

      return (
        <div className={cn("flex items-center space-x-2", isChild && "ml-10")}>
          {hasChildren && !isChild && (
            <Button
              variant="ghost"
              size="icon"
              className="size-4 p-0 hover:bg-transparent"
              onClick={toggleExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </Button>
          )}
          {!hasChildren && !isChild && <div className="w-4" />}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <CategoryBadge
                  category={row.original}
                  className={cn(
                    hasChildren && !isChild
                      ? "cursor-pointer"
                      : "cursor-default",
                  )}
                  onClick={hasChildren && !isChild ? toggleExpanded : undefined}
                />
              </TooltipTrigger>
              <TooltipContent
                className="px-3 py-1.5 text-xs"
                side="right"
                sideOffset={10}
              >
                <CategoryTooltip category={row.original} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {row.original.system && (
            <span className="border border-border px-2 py-1 font-mono text-xs text-muted-foreground">
              System
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isCreateSubcategoryOpen, setIsCreateSubcategoryOpen] =
        useState(false);

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <SquarePenIcon className="size-3.5" />
                Edit
              </DropdownMenuItem>

              {!row.original.isChild && (
                <DropdownMenuItem
                  onClick={() => setIsCreateSubcategoryOpen(true)}
                >
                  <GitBranchPlus className="size-3.5" />
                  Add Subcategory
                </DropdownMenuItem>
              )}

              {!row.original.system && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      table.options.meta?.deleteCategory?.(row.original.id)
                    }
                  >
                    <TrashIcon className="size-3.5" />
                    Remove
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <EditCategoryModal
            id={row.original.id}
            defaultValue={row.original}
            isOpen={isEditOpen}
            onOpenChange={setIsEditOpen}
          />

          <CreateSubCategoryModal
            isOpen={isCreateSubcategoryOpen}
            onOpenChange={setIsCreateSubcategoryOpen}
            parentId={row.original.id}
            defaultTaxRate={row.original.taxRate}
            defaultTaxType={row.original.taxType}
            defaultColor={row.original.color}
            defaultTaxReportingCode={row.original.taxReportingCode}
            defaultExcluded={row.original.excluded}
          /> */}
        </div>
      );
    },
  },
];
