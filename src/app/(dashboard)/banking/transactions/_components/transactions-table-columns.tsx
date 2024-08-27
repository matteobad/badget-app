"use client";

import type dynamicIconImports from "lucide-react/dynamicIconImports";
import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { EllipsisIcon } from "lucide-react";

import Icon from "~/components/icons";
import { TransactionSheet } from "~/components/sheets/transaction-sheet";
import { DataTableColumnHeader } from "~/components/tables/data-table-column-header";
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
import { euroFormat } from "~/lib/utils";
import { type Category, type Transaction } from "./transactions-table";

export function getColumns(categories: Category[]): ColumnDef<Transaction>[] {
  return [
    {
      id: "select",
      maxSize: 40,
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
    },
    {
      accessorKey: "date",
      maxSize: 100,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data" />
      ),
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          {format(row.getValue("date"), "dd MMM yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      enableSorting: false,
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Descrizione" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[200px] truncate font-medium">
              {row.original.description}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => {
        const category = row.original.category;

        return (
          <div className="flex items-center justify-start gap-2">
            <Icon
              name={category.icon as keyof typeof dynamicIconImports}
              className="h-4 w-4"
            />

            <span className="whitespace-nowrap">{category.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "bankAccount",
      header: "Conto",
      cell: ({ row }) => {
        const { bankAccount } = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={bankAccount.logoUrl ?? ""} />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <div className="flex flex-col whitespace-nowrap">
              <span>{bankAccount.name}</span>
              <span className="text-xs text-slate-500">
                {bankAccount.institution}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Importo"
          className="-mr-4 justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right text-lg font-semibold lowercase">
          {euroFormat(row.getValue("amount"))}
        </div>
      ),
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();
        const [showUpdateTaskSheet, setShowUpdateTaskSheet] =
          React.useState(false);
        const [showDeleteTaskDialog, setShowDeleteTaskDialog] =
          React.useState(false);

        return (
          <>
            <TransactionSheet
              open={showUpdateTaskSheet}
              onOpenChange={setShowUpdateTaskSheet}
              data={row.original}
              categories={categories}
            />
            {/* <DeleteTasksDialog
              open={showDeleteTaskDialog}
              onOpenChange={setShowDeleteTaskDialog}
              tasks={[row.original]}
              showTrigger={false}
              onSuccess={() => row.toggleSelected(false)}
            /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="flex size-8 p-0 data-[state=open]:bg-muted"
                >
                  <EllipsisIcon className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onSelect={() => setShowUpdateTaskSheet(true)}>
                  Edit
                </DropdownMenuItem>
                {/* <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={row.original.label}
                        onValueChange={(value) => {
                          startUpdateTransition(() => {
                            toast.promise(
                              updateTask({
                                id: row.original.id,
                                label: value as Task["label"],
                              }),
                              {
                                loading: "Updating...",
                                success: "Label updated",
                                error: (err) => getErrorMessage(err),
                              },
                            );
                          });
                        }}
                    >
                      {tasks.label.enumValues.map((label) => (
                        <DropdownMenuRadioItem
                          key={label}
                          value={label}
                          className="capitalize"
                          disabled={isUpdatePending}
                        >
                          {label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setShowDeleteTaskDialog(true)}
                >
                  Delete
                  <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
      size: 40,
    },
  ];
}
