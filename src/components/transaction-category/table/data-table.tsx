"use client";

import { useMemo, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { CreateTransactionCategoriesModal } from "../modals/create-transaction-category-modal";
import { columns, flattenCategories } from "./columns";
import { Header } from "./table-header";

export function CategoriesDataTable() {
  const [isOpen, onOpenChange] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(
    trpc.transactionCategory.get.queryOptions(),
  );

  const deleteCategoryMutation = useMutation(
    trpc.transactionCategory.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transactionCategory.get.queryKey(),
        });
      },
    }),
  );

  // Flatten categories and filter based on expanded state
  const flattenedData = useMemo(() => {
    const flattened = flattenCategories(data ?? []);

    // Filter to only show parent categories and children of expanded parents
    return flattened.filter((category) => {
      // Always show parent categories
      if (!category.isChild) {
        return true;
      }
      // Only show children if their parent is expanded
      return category.parentId && expandedCategories.has(category.parentId);
    });
  }, [data, expandedCategories]);

  const table = useReactTable({
    data: flattenedData,
    getRowId: ({ id }) => id,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      deleteCategory: (id: string) => {
        deleteCategoryMutation.mutate({ id });
      },
      expandedCategories,
      setExpandedCategories,
    },
  });

  return (
    <div className="w-full">
      <Header table={table} onOpenChange={onOpenChange} />

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
        <CreateTransactionCategoriesModal
          onOpenChange={onOpenChange}
          isOpen={isOpen}
        />
      </Dialog>
    </div>
  );
}
