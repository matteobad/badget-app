"use client";

import React from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Dialog } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { columns } from "./columns";
import { DataTableSkeleton } from "./data-table-skeleton";
import { NoTags } from "./empty-states";

export function DataTable() {
  const [isOpen, onOpenChange] = React.useState(false);
  const [expandedCategories, setExpandedCategories] = React.useState<
    Set<string>
  >(new Set());

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(trpc.tag.get.queryOptions());

  const deleteTagMutation = useMutation(
    trpc.tag.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.tag.get.queryKey(),
        });
      },
    }),
  );

  const table = useReactTable({
    data,
    getRowId: ({ id }) => id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      deleteTag: (id: string) => {
        deleteTagMutation.mutate({ id });
      },
      expandedCategories,
      setExpandedCategories,
    },
  });

  if (!data.length) {
    return (
      <div className="relative h-[calc(100vh-200px)] overflow-hidden">
        <NoTags />
        <DataTableSkeleton isEmpty />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table className="border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="px-4">
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
          {table.getRowModel().rows.map((row) => (
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

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {/* <CreateCategoriesModal onOpenChange={onOpenChange} isOpen={isOpen} /> */}
      </Dialog>
    </div>
  );
}
