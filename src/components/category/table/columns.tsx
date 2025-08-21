/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import * as React from "react";
import { memo, useCallback } from "react";
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
import { useScopedI18n } from "~/shared/locales/client";
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

const ActionsCell = memo(
  ({
    id,
    onViewDetails,
    onCreateSubCategory,
    onDeleteCategory,
  }: {
    id: string;
    onViewDetails?: (id: string) => void;
    onCreateSubCategory?: (id: string) => void;
    onDeleteCategory?: (id: string) => void;
  }) => {
    const tScoped = useScopedI18n("category.actions");

    const handleViewDetails = useCallback(() => {
      onViewDetails?.(id);
    }, [id, onViewDetails]);

    const handleCreateSubCategory = useCallback(() => {
      onCreateSubCategory?.(id);
    }, [id, onCreateSubCategory]);

    const handleDeleteCategory = useCallback(() => {
      onDeleteCategory?.(id);
    }, [id, onDeleteCategory]);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewDetails}>
            {tScoped("view_details")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCreateSubCategory}>
            {tScoped("create_subcategory")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={handleDeleteCategory}
          >
            {tScoped("delete_category")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);
ActionsCell.displayName = "ActionsCell";

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
    meta: {
      className: "w-auto text-right",
    },
    cell: ({ row, table }) => {
      const meta = table.options.meta;

      return (
        <ActionsCell
          id={row.original.id}
          // @ts-expect-error - TODO: fix this
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onViewDetails={meta?.setOpen}
          // @ts-expect-error - TODO: fix this
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onCreateSubCategory={meta?.createSubCategory}
          // @ts-expect-error - TODO: fix this
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onDeleteCategory={meta?.deleteCategory}
        />
      );
    },
  },
];
