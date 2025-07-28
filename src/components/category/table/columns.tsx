"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { dynamicIconImports } from "lucide-react/dynamic";
import { memo, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

import type { ColumnDef } from "@tanstack/react-table";

type Category = RouterOutput["category"]["get"][number];

// Category action component
const ActionsCell = memo(
  ({
    category,
    onViewDetails,
    onDeleteCategory,
  }: {
    category: Category;
    onViewDetails?: (id: string) => void;
    onDeleteCategory?: (id: string) => void;
  }) => {
    const handleViewDetails = useCallback(() => {
      onViewDetails?.(category.id);
    }, [category.id, onViewDetails]);

    const handleDeleteCategory = useCallback(() => {
      onDeleteCategory?.(category.id);
    }, [category.id, onDeleteCategory]);

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
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {category.parentId && (
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDeleteCategory}
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);
ActionsCell.displayName = "ActionsCell";

export const columns: ColumnDef<Category>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="ml-3"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: () => <div className="pl-2 text-left">CATEGORY</div>,
    meta: {
      className: "min-w-[200px]",
    },
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex w-fit items-center space-x-2 rounded-md border px-2 py-1">
          <DynamicIcon
            className="size-4"
            name={category.icon as keyof typeof dynamicIconImports}
          />
          <span>{category.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => <div className="pl-1.5 text-left uppercase">Description</div>,
    meta: {
      className: "w-full min-w-[200px]",
    },
    cell: ({ row }) => (
      <span className="line-clamp-1 text-muted-foreground">
        {row.getValue("description")}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: "text-right md:sticky md:right-0 z-10",
    },
    cell: ({ row, table }) => {
      const meta = table.options.meta;

      return (
        <ActionsCell
          category={row.original}
          // @ts-expect-error - TODO: fix this
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onViewDetails={meta?.setOpen}
          // @ts-expect-error - TODO: fix this
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onDeleteTransaction={meta?.onDeleteTransaction}
        />
      );
    },
  },
];
