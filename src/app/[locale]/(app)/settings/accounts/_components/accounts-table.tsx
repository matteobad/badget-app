"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ChevronsUpDownIcon,
  Columns3Icon,
  DownloadIcon,
  FilterIcon,
  MoreHorizontal,
  Trash2Icon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { deleteTransactionAction } from "~/server/actions";
import { type QUERIES } from "~/server/db/queries";
import { type DB_InstitutionType } from "~/server/db/schema/open-banking";
import { formatAmount } from "~/utils/format";

export type AccountType = Awaited<
  ReturnType<typeof QUERIES.getAccountsWithConnectionsForUser>
>[number];

export default function AccountDataTable({ data }: { data: AccountType[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const deleteTransaction = useAction(deleteTransactionAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      console.log(data?.message);
      toast.success("Transazione eliminata!");
    },
  });

  const columns: ColumnDef<AccountType>[] = useMemo(
    () => [
      {
        id: "select",
        size: 40,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="mt-1"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="mt-1"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        size: 90,
        header: ({ column }) => {
          return (
            <Button
              variant="link"
              className="px-0"
              onClick={() => column.toggleSorting()}
            >
              Nome
              <ChevronsUpDownIcon className="size-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <div>{row.getValue("name")}</div>;
        },
      },
      {
        accessorKey: "institution",
        header: () => {
          return <div className="text-neutral-900">Banca</div>;
        },
        cell: ({ row }) => {
          const institution: DB_InstitutionType | null =
            row.getValue("institution");
          <div className="line-clamp-1">{institution?.name ?? "Manual"}</div>;
        },
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => {
          return (
            <Button
              variant="link"
              className="px-0"
              onClick={() => column.toggleSorting()}
            >
              Aggiornato al
              <ChevronsUpDownIcon className="size-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const updatedAt: Date = row.getValue("updatedAt");
          return <div>{format(updatedAt, "MM/dd hh:mm")}</div>;
        },
      },
      // {
      //   accessorKey: "expires_at",
      //   header: () => {
      //     return <div className="text-neutral-900">Categoria</div>;
      //   },
      //   cell: ({ row }) => {
      //     const category: DB_CategoryType = row.getValue("category");
      //     return <div>{category?.name}</div>;
      //   },
      // },
      {
        accessorKey: "balance",
        header: () => {
          return <div className="text-neutral-900">Saldo</div>;
        },
        cell: ({ row }) => {
          const balance = parseFloat(row.getValue("balance"));
          return <div>{formatAmount({ amount: balance })}</div>;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        enableResizing: false,
        size: 44,
        header: () => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 p-0"
                  disabled={Object.keys(rowSelection).length === 0}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                  {Object.keys(rowSelection).length > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-xs font-light text-primary-foreground">
                      {Object.keys(rowSelection).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <DownloadIcon />
                  Esporta come CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  disabled={deleteTransaction.isExecuting}
                  onClick={() => {
                    deleteTransaction.execute({
                      ids: Object.keys(rowSelection),
                    });
                    table.resetRowSelection(true);
                  }}
                >
                  <Trash2Icon /> Elimina selezionati
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Download file</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                disabled={deleteTransaction.isExecuting}
                onClick={() => {
                  deleteTransaction.execute({ ids: [row.original.id] });
                }}
              >
                Elimina movimento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteTransaction, rowSelection],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id, //use the row's uuid from your database as the row id
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="relative">
          <Input
            placeholder="Cerca movimenti..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm ps-9 pe-9"
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <FilterIcon size={16} strokeWidth={2} />
          </div>
        </div>
        <span className="flex-1"></span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Columns3Icon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <AddTransaction label="Aggiungi" /> */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-11"
                      style={{
                        width: header.getSize(),
                      }}
                    >
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>
    </div>
  );
}
