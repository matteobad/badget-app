"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { useBankAccountFilterParams } from "~/hooks/use-bank-account-filter-params";
import { useBankAccountParams } from "~/hooks/use-bank-account-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { columns } from "./columns";
import { NoAccounts, NoResults } from "./empty-states";
import { Loading } from "./loading";

export function DataTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const { setParams } = useBankAccountParams();
  const { hasFilters } = useBankAccountFilterParams();

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data } = useQuery(trpc.bankAccount.get.queryOptions({}));

  const deleteBankAccountMutation = useMutation(
    trpc.bankAccount.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey({}),
        });
      },
    }),
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      rowSelection,
      globalFilter,
    },
    meta: {
      setOpen: (id: string) => {
        void setParams({ bankAccountId: id });
      },
      deleteBankAccount: (id: string) => {
        deleteBankAccountMutation.mutate({ id });
      },
    },
  });

  if (!data?.length && !hasFilters) {
    return (
      <div className="relative h-[calc(100vh-200px)] overflow-hidden px-6">
        <NoAccounts />
        <Loading isEmpty />
      </div>
    );
  }

  if (!data?.length && hasFilters) {
    return (
      <div className="relative h-[calc(100vh-200px)] overflow-hidden px-6">
        <NoResults />
        <Loading isEmpty />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table className="border-t">
        {/* Transaction Rows */}
        <TableBody>
          {table.getFilteredRowModel().rows.map((row) => (
            <TableRow className="hover:bg-transparent" key={row.id}>
              {row.getVisibleCells().map((cell, index) => (
                <TableCell
                  key={cell.id}
                  className={cn(index === 3 && "w-[50px]")}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
