"use client";

import type {
  Column,
  ColumnDef,
  ColumnPinningState,
  SortingState,
} from "@tanstack/react-table";
import type { CSSProperties } from "react";
import { Fragment, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type dynamicIconImports } from "lucide-react/dynamic";

import { CategoryBadge } from "~/components/category-badge";
import { CurrencyInput } from "~/components/custom/currency-input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { type QUERIES } from "~/server/db/queries";

type CategoryWithBudgets = Awaited<
  ReturnType<typeof QUERIES.getCategoriesWithBudgets>
>[number];

// Helper function to compute pinning styles for columns
const getPinningStyles = (
  column: Column<CategoryWithBudgets>,
): CSSProperties => {
  const isPinned = column.getIsPinned();
  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
};

export default function Component({ data }: { data: CategoryWithBudgets[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ["expander", "name", "email"],
    right: [],
  });

  const columns: ColumnDef<CategoryWithBudgets>[] = useMemo(
    () => [
      {
        header: "Categoria",
        accessorKey: "name",
        size: 200,
        cell: ({ row }) => {
          const name = row.original.name ?? undefined;
          const color = row.original.color ?? undefined;
          const icon = row.original.icon as keyof typeof dynamicIconImports;

          return (
            <div className="flex items-center gap-2">
              <CategoryBadge name={name} color={color} icon={icon} />
            </div>
          );
        },
      },
      {
        header: "Annuale",
        accessorKey: "email",
      },
      {
        header: "Gennaio",
        accessorFn: (row) => row.budgets[0]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              <CurrencyInput value={row.original.budgets[0]?.amount} />
              {}
            </span>
          </div>
        ),
      },
      {
        header: "Febbraio",
        accessorFn: (row) => row.budgets[1]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[1]?.amount}
            </span>
          </div>
        ),
      },
      {
        header: "Marzo",
        accessorFn: (row) => row.budgets[2]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[2]?.amount}
            </span>
          </div>
        ),
      },
      {
        header: "Aprile",
        accessorFn: (row) => row.budgets[3]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[3]?.amount}
            </span>
          </div>
        ),
      },
      {
        header: "Maggio",
        accessorFn: (row) => row.budgets[4]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[4]?.amount}
            </span>
          </div>
        ),
      },
      {
        header: "Giugno",
        accessorFn: (row) => row.budgets[5]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[5]?.amount}
            </span>
          </div>
        ),
      },
      {
        header: "Luglio",
        accessorFn: (row) => row.budgets[6]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[6]?.amount}
            </span>
          </div>
        ),
      },
      {
        header: "Agosto",
        accessorFn: (row) => row.budgets[7]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[7]?.amount}
            </span>
          </div>
        ),
      },
      {
        header: "Settembre",
        accessorFn: (row) => row.budgets[8]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[8]?.amount}
            </span>
          </div>
        ),
      },
      {
        header: "Ottobre",
        accessorFn: (row) => row.budgets[9]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[9]?.amount}
            </span>
          </div>
        ),
      },
      {
        header: "Novembre",
        accessorFn: (row) => row.budgets[10]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[10]?.amount}
            </span>
          </div>
        ),
      },
      {
        header: "Dicembre",
        accessorFn: (row) => row.budgets[11]?.amount,
        cell: ({ row }) => (
          <div className="truncate">
            <span className="text-lg leading-none">
              {row.original.budgets[11]?.amount}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnPinningChange: setColumnPinning,
    state: {
      sorting,
      columnPinning,
    },
    enableSortingRemoval: false,
  });

  return (
    <div className="w-auto overflow-hidden rounded-lg border bg-background">
      <Table
        className="table-fixed border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b"
        style={{
          width: table.getTotalSize(),
        }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map((header) => {
                const { column } = header;
                const isPinned = column.getIsPinned();
                const isLastLeftPinned =
                  isPinned === "left" && column.getIsLastColumn("left");
                const isFirstRightPinned =
                  isPinned === "right" && column.getIsFirstColumn("right");

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "relative h-10 truncate data-pinned:bg-muted/90 data-pinned:backdrop-blur-xs [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-l [&[data-pinned][data-last-col]]:border-border",
                      {
                        "rounded-tl-lg": isPinned && column.getIsFirstColumn(),
                      },
                    )}
                    colSpan={header.colSpan}
                    style={{ ...getPinningStyles(column) }}
                    data-pinned={isPinned || undefined}
                    data-last-col={
                      isLastLeftPinned
                        ? "left"
                        : isFirstRightPinned
                          ? "right"
                          : undefined
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </span>
                      {/* Pin/Unpin column controls with enhanced accessibility */}

                      {header.column.getCanResize() && (
                        <div
                          {...{
                            onDoubleClick: () => header.column.resetSize(),
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className:
                              "absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:-translate-x-px",
                          }}
                        />
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const { column } = cell;
                    const isPinned = column.getIsPinned();
                    const isLastLeftPinned =
                      isPinned === "left" && column.getIsLastColumn("left");
                    const isFirstRightPinned =
                      isPinned === "right" && column.getIsFirstColumn("right");

                    return (
                      <TableCell
                        key={cell.id}
                        className="truncate data-pinned:bg-background/90 data-pinned:backdrop-blur-xs [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l [&[data-pinned][data-last-col]]:border-border"
                        style={{ ...getPinningStyles(column) }}
                        data-pinned={isPinned || undefined}
                        data-last-col={
                          isLastLeftPinned
                            ? "left"
                            : isFirstRightPinned
                              ? "right"
                              : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter className="bg-transparent">
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={7}>Total</TableCell>
            <TableCell className="text-right">$2,500.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
