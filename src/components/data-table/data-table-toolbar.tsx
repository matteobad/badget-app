"use client";

import type { Table } from "@tanstack/react-table";
import * as React from "react";
import { SearchIcon, X } from "lucide-react";

import { DataTableViewOptions } from "~/components/data-table/data-table-view-options";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { type DataTableAdvancedFilterField } from "~/utils/data-table";
import { DataTableFilters } from "./data-table-filters";

interface DataTableToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  /**
   * An array of filter field configurations for the data table.
   * When options are provided, a faceted filter is rendered.
   * Otherwise, a search filter is rendered.
   *
   * @example
   * const filterFields = [
   *   {
   *     id: 'name',
   *     label: 'Name',
   *     placeholder: 'Filter by name...'
   *   },
   *   {
   *     id: 'status',
   *     label: 'Status',
   *     options: [
   *       { label: 'Active', value: 'active', icon: ActiveIcon, count: 10 },
   *       { label: 'Inactive', value: 'inactive', icon: InactiveIcon, count: 5 }
   *     ]
   *   }
   * ]
   */
  filterFields?: DataTableAdvancedFilterField<TData>[];
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Memoize computation of searchableColumns and filterableColumns
  const { searchableColumns, filterableColumns } = React.useMemo(() => {
    return {
      searchableColumns: filterFields.filter((f) => f.type === "text"),
      filterableColumns: filterFields.filter((f) => f.type !== "text"),
    };
  }, [filterFields]);

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 overflow-auto",
        className,
      )}
      {...props}
    >
      <div className="relative flex flex-1 items-center gap-2">
        {searchableColumns.length > 0 &&
          searchableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <div className="relative" key={String(column.id)}>
                  <SearchIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                  <Input
                    placeholder={column.placeholder}
                    value={
                      (table
                        .getColumn(String(column.id))
                        ?.getFilterValue() as string) ?? ""
                    }
                    onChange={(event) =>
                      table
                        .getColumn(String(column.id))
                        ?.setFilterValue(event.target.value)
                    }
                    className="h-9 w-40 pl-10 lg:w-64"
                  />
                </div>
              ),
          )}
        {filterableColumns.length > 0 && (
          <>
            <DataTableFilters
              table={table}
              filterableColumns={filterableColumns}
            />
            {/* {filterableColumns.map(
              (column) =>
                table.getColumn(column.id ? String(column.id) : "") && (
                  <DataTableFacetedFilter
                    key={String(column.id)}
                    column={table.getColumn(column.id ? String(column.id) : "")}
                    title={column.label}
                    options={column.options ?? []}
                  />
                ),
            )} */}
          </>
        )}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        {children}
      </div>
    </div>
  );
}
