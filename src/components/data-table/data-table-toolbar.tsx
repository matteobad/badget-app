"use client";

import * as React from "react";
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { type DataTableFilterField } from "~/utils/data-table";
import { SearchIcon } from "lucide-react";

import type { Table } from "@tanstack/react-table";
import { DataTableFilters } from "./data-table-filters";
import { DateFilterFaceted } from "./filters/date-filter";
import { MultiSelectFaceted } from "./filters/multi-select-filter";
import { NumberFilterFaceted } from "./filters/number-filter";

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
  filterFields?: DataTableFilterField<TData>[];
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
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
                    className="h-9 w-44 pl-10 lg:w-64"
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
            {filterableColumns.map((filterableColumn) => {
              const column = table.getColumn(
                filterableColumn.id ? String(filterableColumn.id) : "",
              );

              return (
                <React.Fragment key={filterableColumn.id}>
                  {filterableColumn.type === "date" && (
                    <DateFilterFaceted column={column!} />
                  )}
                  {filterableColumn.type === "multi-select" && (
                    <MultiSelectFaceted
                      column={column!}
                      options={filterableColumn.options!}
                    />
                  )}
                  {filterableColumn.type === "number" && (
                    <NumberFilterFaceted column={column!} />
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        {children}
      </div>
    </div>
  );
}
