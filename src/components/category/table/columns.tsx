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
import { MoreHorizontalIcon } from "lucide-react";

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
    cell: ({ row }) => {
      const isChild = row.original.parentId;

      return (
        <div className={cn("flex items-center space-x-2", isChild && "ml-8")}>
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
    meta: {
      className: "w-[350px] max-w-[350px]",
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
    meta: {
      className: "hidden md:table-cell",
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
