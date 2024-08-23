"use client";

import type dynamicIconImports from "lucide-react/dynamicIconImports";
import * as React from "react";
import { DownloadIcon, ShapesIcon } from "lucide-react";

import type {
  getFilteredTransactions,
  getUserBankAccounts,
} from "~/server/db/queries/cached-queries";
import { DateRangePicker } from "~/components/data-range-picker";
import Icon from "~/components/icons";
import { DataTable } from "~/components/tables/data-tables";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { type DataTableFilterField } from "~/configs/data-table";
import { useDataTable } from "~/hooks/use-data-table";
import { euroFormat } from "~/lib/utils";
import { type getUserCategories } from "~/server/db/queries/cached-queries";
import { DataTableToolbar } from "./data-table-toolbar";
import { getColumns } from "./transactions-table-columns";

export type Transaction = Awaited<
  ReturnType<typeof getFilteredTransactions>
>["data"][number];

export type Category = Awaited<ReturnType<typeof getUserCategories>>[number];
export type Account = Awaited<ReturnType<typeof getUserBankAccounts>>[number];

export function TransactionsTable({
  data,
  pageCount,
  categories,
  accounts,
}: {
  data: Transaction[];
  pageCount: number;
  categories: Category[];
  accounts: Account[];
}) {
  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo(() => getColumns(categories), [categories]);

  const filterFields: DataTableFilterField<Transaction>[] = [
    {
      label: "Title",
      value: "description",
      placeholder: "Cerca transazioni...",
    },
    {
      label: "Categoria",
      value: "category",
      options: categories.map((category) => ({
        label: category.name,
        value: category.id.toString(),
        icon: category.icon as keyof typeof dynamicIconImports,
        withCount: true,
      })),
    },
    {
      label: "Conto",
      value: "bankAccount",
      options: accounts.map((account) => ({
        label: account.name,
        value: account.id.toString(),
        // icon: category.icon as keyof typeof dynamicIconImports,
        withCount: true,
      })),
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: {
      sorting: [{ id: "date", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    // For remembering the previous row selection on page change
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
  });

  // const selected = table.getFilteredSelectedRowModel().rows

  return (
    <div className="relative flex flex-col gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="absolute -top-16 right-0 flex items-center gap-6 self-center py-2">
          <div className="flex gap-2 text-sm text-slate-900">
            <span>
              {table.getFilteredSelectedRowModel().rows.length} Transazioni
            </span>
            <span>
              {euroFormat(
                table.getFilteredSelectedRowModel().rows.reduce((tot, item) => {
                  return (tot += parseFloat(item.original.amount ?? "0"));
                }, 0),
              )}
            </span>
          </div>
          <div className="flex gap-4">
            <Button size="sm">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Separator orientation="vertical" className="h-9" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ShapesIcon className="mr-2 h-4 w-4" />
                  Categorizza
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  {categories.map((category) => {
                    return (
                      <DropdownMenuItem key={category.id}>
                        <Icon
                          name={
                            category.icon as keyof typeof dynamicIconImports
                          }
                          className="mr-2 h-4 w-4"
                        />
                        <span className="capitalize">{category.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      <DataTableToolbar table={table} filterFields={filterFields}>
        <DateRangePicker
          triggerSize="sm"
          triggerClassName="ml-auto w-56 sm:w-60"
          align="end"
        />
      </DataTableToolbar>
      <DataTable table={table}></DataTable>
    </div>
  );
}
