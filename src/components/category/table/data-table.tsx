"use client";

import type { CategoryType } from "~/shared/constants/enum";
import React, { useEffect, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { useCategoryFilterParams } from "~/hooks/use-category-filter-params";
import { useCategoryParams } from "~/hooks/use-category-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";

import type { SortingState } from "@tanstack/react-table";
import { columns, flattenCategories } from "./columns";
import { DataTableSkeleton } from "./data-table-skeleton";
import { NoCategories, NoResults } from "./empty-states";

export function DataTable(props: { type: CategoryType }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "type", desc: true },
  ]); // can set initial sorting state here

  const { setParams } = useCategoryParams();
  const { filter, hasFilters } = useCategoryFilterParams();

  console.log(filter);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(
    trpc.transactionCategory.get.queryOptions({}),
  );

  const deleteCategoryMutation = useMutation(
    trpc.category.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.transactionCategory.get.queryKey({}),
        });
      },
    }),
  );

  // Flatten categories and filter based on expanded state
  const flattenedData = React.useMemo(() => {
    const flattened = flattenCategories(data ?? []);

    // Filter to only show parent categories and children of expanded parents
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return flattened.filter((category) => category.type === props.type);
  }, [data, props.type]);

  const table = useReactTable({
    data: flattenedData,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getRowId: ({ id }) => id,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    meta: {
      deleteCategory: (id: string) => {
        deleteCategoryMutation.mutate({ id });
      },
    },
  });

  useEffect(() => {
    table?.getColumn("name")?.setFilterValue(filter.q);
  }, [filter.q, table]);

  if (!data.length && !hasFilters) {
    return (
      <div className="relative h-[calc(100vh-200px)] overflow-hidden">
        <NoCategories />
        <DataTableSkeleton isEmpty />
      </div>
    );
  }

  if (!data.length && hasFilters) {
    return (
      <div className="relative h-[calc(100vh-200px)] overflow-hidden">
        <NoResults />
        <DataTableSkeleton isEmpty />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table className="">
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow className="border-b-0" key={row.id}>
              {row.getVisibleCells().map((cell, index) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    index === 3 && "w-[50px]", // @ts-expect-error - TODO: fix this
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    cell.column.columnDef.meta?.className,
                  )}
                  onClick={() => {
                    if (
                      cell.column.id !== "select" &&
                      cell.column.id !== "actions"
                    ) {
                      void setParams({
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        categoryId: row.original.id as string,
                      });
                    }
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <CreateCategoriesModal onOpenChange={onOpenChange} isOpen={isOpen} />
      </Dialog> */}
    </div>
  );
}
