"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { columns } from "./invitations-columns";
import { DataTableHeader } from "./invitations-table-header";

export function DataTable() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const trpc = useTRPC();

  const { data } = useSuspenseQuery({
    ...trpc.space.listInvitations.queryOptions(),
  });

  const table = useReactTable({
    getRowId: (row) => row.id,
    data,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      <DataTableHeader table={table} />

      <Table>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-transparent"
              >
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "border-r-[0px] py-4",
                      cell.column.columnDef.meta?.className,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-[360px] text-center"
              >
                <h2 className="font-medium mb-1">
                  No Pending Invitations Found
                </h2>
                <span className="text-[#606060]">
                  Use the button above to invite a Team Member.
                </span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
