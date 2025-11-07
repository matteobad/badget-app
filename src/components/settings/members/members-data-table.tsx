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
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { useUserQuery } from "~/hooks/use-user";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { InviteMembersModal } from "./invite-members-modal";
import { columns } from "./members-columns";

export function DataTable() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isOpen, onOpenChange] = useState(false);

  const trpc = useTRPC();
  const { data: user } = useUserQuery();

  const { data } = useSuspenseQuery({
    ...trpc.space.listMembers.queryOptions(),
  });

  console.log(data);

  const table = useReactTable({
    getRowId: (row) => row.id,
    data: data.members ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
    meta: {
      currentUser: data?.members.find(
        (member) => member?.user?.id === user?.id,
      ),
      totalOwners: data?.members.filter((member) => member?.role === "owner")
        .length,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center pb-4 space-x-4">
        <Input
          className="flex-1"
          placeholder="Search..."
          value={(table.getColumn("user")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("user")?.setFilterValue(event.target.value)
          }
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
        />
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <Button onClick={() => onOpenChange(true)}>Invite member</Button>
          <InviteMembersModal onOpenChange={onOpenChange} />
        </Dialog>
      </div>
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
