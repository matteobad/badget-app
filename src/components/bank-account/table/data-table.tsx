"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FormatAmount } from "~/components/format-amount";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useBankAccountParams } from "~/hooks/use-bank-account-params";
import { cn } from "~/lib/utils";
// Group transactions by date
import { ACCOUNT_TYPE_GROUP } from "~/shared/constants/acconts";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { columns } from "./columns";

// Mock data types
type BankAccount = RouterOutput["bankAccount"]["get"][number];

const groupAccountsByTypeGroup = (accounts: BankAccount[]) => {
  const groups: Record<string, BankAccount[]> = {};

  accounts.forEach((account) => {
    // Use ACCOUNT_TYPE_GROUP to get the group key for the account type
    const groupKey = ACCOUNT_TYPE_GROUP[account.type];
    groups[groupKey] ??= [];
    groups[groupKey].push(account);
  });

  return groups;
};

export function DataTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const { setParams } = useBankAccountParams();

  const trpc = useTRPC();
  const { data } = useQuery(trpc.bankAccount.get.queryOptions({}));

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
  });

  const groupedAccounts = groupAccountsByTypeGroup(
    table.getFilteredRowModel().rows.map((row) => row.original),
  );

  return (
    <div className="w-full space-y-4">
      {/* Table Groups as Cards */}
      {/* Single Sticky Header */}
      <div className="sticky top-0 z-10 mb-4 rounded-lg bg-neutral-50">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="!border-b-0">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "py-3 text-xs font-normal tracking-wide text-muted-foreground", // @ts-expect-error - TODO: fix this
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      header.column.columnDef.meta?.className,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>

      {/* Transaction Groups as Cards */}
      <div className="space-y-4">
        {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
          <div key={type} className="overflow-hidden rounded-lg">
            <Table>
              <TableHeader className="bg-neutral-50 p-1">
                {/* Date Group Header */}
                <TableRow className="!border-b-0 bg-transparent hover:bg-transparent">
                  <TableCell className="pl-[5px]">
                    <div className="flex items-center justify-between px-4 pt-2 pb-1">
                      <div className="flex items-center gap-2">
                        <Checkbox className="opacity-50" />
                        <span className="pl-2 text-xs text-muted-foreground">
                          {`${type} • ${typeAccounts.length}`}
                        </span>
                      </div>
                      <span className="text-right text-xs text-muted-foreground">
                        <FormatAmount
                          amount={typeAccounts.reduce(
                            (sum, a) => sum + a.balance,
                            0,
                          )}
                          currency="EUR"
                        />
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableHeader>
              {/* Transaction Rows */}
              <TableBody className="bg-neutral-50">
                <div className="mx-1 mb-1 w-[calc(100%-8px)] overflow-hidden rounded-lg border bg-background shadow">
                  {table
                    .getFilteredRowModel()
                    .rows.filter(
                      (row) => ACCOUNT_TYPE_GROUP[row.original.type] === type,
                    )
                    .map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(
                          "border-border bg-transparent not-last:border-b hover:!bg-neutral-50",
                        )}
                        onClick={() => {
                          void setParams({
                            bankAccountId: row.original.id,
                          });
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "overflow-hidden border-neutral-50 py-4",
                              // @ts-expect-error - TODO: fix this
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                              cell.column.columnDef.meta?.className,
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </div>
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  );
}
