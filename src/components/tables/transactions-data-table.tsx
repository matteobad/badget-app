"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "~/lib/utils";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { type Transaction } from "./transactions-columns";
import { TransactionsTableHeader } from "./transactions-table-header";

interface DataTableProps {
  columns: ColumnDef<Transaction>[];
  data: Transaction[];
}

export function TransactionsDataTable({
  columns,
  data: initialData,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState(initialData);

  const table = useReactTable({
    // @ts-expect-error need better typings
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getRowId: (row) => row.id,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <div className="relative mb-8">
      <Table>
        <TransactionsTableHeader table={table} />

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="h-[40px] cursor-default md:h-[45px]"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "px-3 py-2 md:px-4",
                      (cell.column.id === "select" ||
                        cell.column.id === "actions" ||
                        cell.column.id === "category" ||
                        cell.column.id === "bank_account" ||
                        cell.column.id === "assigned" ||
                        cell.column.id === "method" ||
                        cell.column.id === "status") &&
                        "hidden md:table-cell",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
