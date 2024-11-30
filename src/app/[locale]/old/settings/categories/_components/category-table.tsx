"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import type dynamicIconImports from "lucide-react/dynamicIconImports";
import * as React from "react";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryState } from "nuqs";

import Icon from "~/components/icons";
import { CategorySheet } from "~/components/sheets/category-sheet";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn, euroFormat } from "~/lib/utils";
import { type getUserCategories } from "~/server/db/queries/cached-queries";
import { BudgetPeriod } from "~/server/db/schema/enum";

export type Category = Awaited<ReturnType<typeof getUserCategories>>[number];

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Categoria",
    cell: ({ row }) => (
      <div className="capitalize">
        <div className="flex items-center justify-start gap-2">
          <Icon
            name={row.original.icon as keyof typeof dynamicIconImports}
            className="h-4 w-4"
          />

          <span className="whitespace-nowrap">{row.getValue("name")}</span>
          {!row.original.manual && <Badge variant="secondary">system</Badge>}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "macro",
    header: "Macro Categoria",
    cell: ({ row }) => (
      <div className="flex flex-col capitalize">
        <div className="flex items-center gap-2">{row.getValue("macro")}</div>
        <div className="text-xs lowercase text-slate-500">
          {row.original.type}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "budgets",
    header: "Budget",
    cell: ({ row }) => {
      const budget = row.original.budgets[0];

      console.log(budget);
      if (!budget || Number(budget.budget) === 0) return "No Budget";

      return (
        <div className="flex flex-col text-right capitalize">
          <span>{euroFormat(budget.budget ?? 0)}</span>
          <div className="text-xs lowercase text-slate-500">
            {budget.period}
          </div>
        </div>
      );
    },
  },
];

export function CategoryTable({ data }: { data: Category[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [categoryId, setCategoryId] = useQueryState("id");
  const setOpen = setCategoryId;

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter categories..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
      </div>
      <div className="-mx-6">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn({
                        "pr-9 text-right": header.id === "budgets",
                        "pl-9": header.id === "name",
                      })}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => setCategoryId(row.original.id.toString())}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn({
                        "pr-9 text-right": cell.id.includes("budgets"),
                        "pl-9": cell.id.includes("name"),
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nessun risultato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-4 w-full text-center text-sm font-light text-slate-500">
          Hai {data.length} categorie in totale
        </div>

        <CategorySheet
          isOpen={Boolean(categoryId)}
          setOpen={setOpen}
          id={categoryId}
          categories={data}
        />
      </div>
    </div>
  );
}
