"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { Ellipsis, Wallet2Icon } from "lucide-react";
import { type dynamicIconImports } from "lucide-react/dynamic";

import { CategoryBadge } from "~/components/category-badge";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type getAccounts_CACHED } from "~/features/account/server/cached-queries";
import { type getCategories_CACHED } from "~/features/category/server/cached-queries";
import { type DB_TagType } from "~/server/db/schema/transactions";
import { type DataTableRowAction } from "~/utils/data-table";
import { formatAmount } from "~/utils/format";
import { type getTransactions_CACHED } from "../../server/cached-queries";

export type TransactionType = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];

interface GetColumnsProps {
  accounts: Awaited<ReturnType<typeof getAccounts_CACHED>>;
  categories: Awaited<ReturnType<typeof getCategories_CACHED>>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<TransactionType> | null>
  >;
}

export function getColumns({
  accounts,
  categories,
  setRowAction,
}: GetColumnsProps): ColumnDef<TransactionType>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data" />
      ),
      cell: ({ cell }) => format(cell.getValue() as Date, "LLL dd"),
      filterFn: (row, id, value) => {
        if (!Array.isArray(value) || !value[0] || !value[1]) return false;
        const date: TransactionType["date"] = row.getValue(id);
        const start = parseISO(value[0] as string);
        const end = parseISO(value[1] as string);
        return isWithinInterval(date, { start, end });
      },
      size: 100,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Descrizione" />
      ),
      cell: ({ row }) => (
        <div className="line-clamp-1">{row.getValue("description")}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "amount",
      // sortingFn: "", TODO: add custom sorting fn
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Importo" />
      ),
      cell: ({ row }) => {
        const amount = Number(row.getValue("amount"));
        const currency = row.original.currency;
        if (isNaN(amount)) return null;
        return <div>{formatAmount({ amount, currency })}</div>;
      },
      filterFn: "inNumberRange",
    },
    {
      accessorKey: "categoryId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Categoria" />
      ),
      cell: ({ row }) => {
        const id = row.getValue("categoryId");
        const category = categories.find((c) => c.id === id);

        return (
          <div className="flex items-center gap-2">
            <CategoryBadge
              name={category?.name ?? "Uncategorized"}
              color={category?.color ?? ""}
              icon={
                (category?.icon ??
                  "circle-dashed") as keyof typeof dynamicIconImports
              }
            />
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const categoryId = row.getValue(id);
        const selectedCategories = Array.isArray(value) ? value : [];
        return selectedCategories.some((v) =>
          v === "null" ? categoryId === null : v === categoryId,
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "tags",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ row }) => {
        const tags: DB_TagType[] = row.getValue("tags");

        return (
          <div className="flex items-center gap-2">
            {tags.map((tag) => {
              return (
                <Badge variant="secondary" key={tag.id}>
                  {tag.text}
                </Badge>
              );
            })}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const tags: TransactionType["tags"] = row.getValue(id);
        const tagSet = new Set(tags.map((t) => t.id));
        const selectedTagSet = new Set(Array.isArray(value) ? value : []);
        return tagSet.intersection(selectedTagSet).size > 0;
      },
      enableSorting: false,
    },
    {
      accessorKey: "accountId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Conto" />
      ),
      cell: ({ row }) => {
        const id = row.getValue("accountId");
        const account = accounts.find((c) => c.id === id);

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              <AvatarImage
                src={account?.logoUrl ?? ""}
                alt={`${account?.name} logo`}
              ></AvatarImage>
              <AvatarFallback>
                <Wallet2Icon className="size-3" />
              </AvatarFallback>
            </Avatar>
            <span className="whitespace-nowrap">{account?.name}</span>
          </div>
        );
      },
      filterFn: "arrIncludesSome",
      enableSorting: false,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "update" })}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "delete" })}
              >
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}
