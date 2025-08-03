/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { ChevronDown, ChevronRight, MoreHorizontalIcon } from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";
import { CategoryBadge } from "../category-badge";

export type Category = RouterOutput["transactionCategory"]["get"][number];

// Flatten categories to include both parents and children with hierarchy info
export function flattenCategories(categories: any[]): any[] {
  const flattened: any[] = [];

  for (const category of categories) {
    // Add parent category
    flattened.push({
      ...category,
      isChild: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      hasChildren: category.children && category.children.length > 0,
    });

    // Add children if they exist
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (category.children && category.children.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      for (const child of category.children) {
        flattened.push({
          ...child,
          isChild: true,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          parentId: category.id,
          hasChildren: false,
        });
      }
    }
  }

  return flattened;
}

export const columns: ColumnDef<Category>[] = [
  {
    header: "Categories",
    accessorKey: "name",
    cell: ({ row, table }) => {
      // Get expanded state from table meta or use local state as fallback
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const tableExpandedCategories =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (table.options.meta as any)?.expandedCategories;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const setTableExpandedCategories =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (table.options.meta as any)?.setExpandedCategories;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const isExpanded = tableExpandedCategories.has(row.original.id);
      const hasChildren = row.original.children.length > 0;
      const isChild = row.original.parentId;

      const toggleExpanded = () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const newExpanded = new Set(tableExpandedCategories);
        if (isExpanded) {
          newExpanded.delete(row.original.id);
        } else {
          newExpanded.add(row.original.id);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        setTableExpandedCategories(newExpanded);
      };

      return (
        <div className={cn("flex items-center space-x-2", isChild && "ml-10")}>
          {hasChildren && !isChild && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={toggleExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          {!hasChildren && !isChild && <div className="w-4" />}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <CategoryBadge category={row.original} />
              </TooltipTrigger>
              {row.original?.description && (
                <TooltipContent
                  className="px-3 py-1.5 text-xs"
                  side="right"
                  sideOffset={10}
                >
                  {row.original.description}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    header: "Description",
    accessorKey: "description",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">
          {row.getValue("description")}
        </span>
      );
    },
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">{row.getValue("type")}</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const [, setIsEditOpen] = React.useState(false);
      const [, setIsCreateSubcategoryOpen] = React.useState(false);

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setIsCreateSubcategoryOpen(true)}
              >
                Create Subcategory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  // @ts-expect-error type tanstack meta
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
                  table.options.meta?.deleteCategory?.(row.original.id)
                }
              >
                Remove
              </DropdownMenuItem>
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
          /> */}
        </div>
      );
    },
  },
];
