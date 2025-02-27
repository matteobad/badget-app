"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { format } from "date-fns";
import { Ellipsis, Wallet2Icon } from "lucide-react";
import { type dynamicIconImports } from "lucide-react/dynamic";

import { CategoryBadge } from "~/components/category-badge";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import { type DB_AccountType } from "~/server/db/schema/accounts";
import { type DataTableRowAction } from "~/utils/data-table";
import { formatAmount } from "~/utils/format";
import { type getTransactions_CACHED } from "../../server/cached-queries";

export type TransactionType = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<TransactionType> | null>
  >;
}

export function getColumns({
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
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Categoria" />
      ),
      cell: ({ row }) => {
        const name = row.original.category?.name ?? undefined;
        const color = row.original.category?.color ?? undefined;
        const icon = row.original.category?.icon ?? undefined;

        return (
          <div className="flex items-center gap-2">
            <CategoryBadge
              name={name}
              color={color}
              icon={icon as keyof typeof dynamicIconImports}
            />
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
      enableSorting: false,
    },
    {
      accessorKey: "account",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Conto" />
      ),
      cell: ({ row }) => {
        const account: DB_AccountType = row.getValue("account");

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              <AvatarImage
                src={account.logoUrl!}
                alt={`${account.name} logo`}
              ></AvatarImage>
              <AvatarFallback>
                <Wallet2Icon className="size-3" />
              </AvatarFallback>
            </Avatar>
            {account.name}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
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
