"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type dynamicIconImports from "lucide-react/dynamicIconImports";
import { Fragment, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowRightIcon,
  ChevronDown,
  ChevronUp,
  Columns3Icon,
  DownloadIcon,
  FilterIcon,
  MoreHorizontal,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { useQueryState } from "nuqs";

import { Badge } from "~/components/ui/badge";
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
import { type QUERIES } from "~/server/db/queries";

type Category = Awaited<
  ReturnType<typeof QUERIES.getCategoriesForUser>
>[number];

export default function CategoryDataTable({
  categories,
}: {
  categories: Category[];
}) {
  const [, setOpen] = useQueryState("add");
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<Category>[] = useMemo(
    () => [
      {
        id: "expander",
        size: 44,
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <Button
              {...{
                className: "size-7 shadow-none text-muted-foreground",
                onClick: row.getToggleExpandedHandler(),
                "aria-expanded": row.getIsExpanded(),
                "aria-label": row.getIsExpanded()
                  ? `Collapse details for ${row.original.name}`
                  : `Expand details for ${row.original.name}`,
                size: "icon",
                variant: "ghost",
              }}
            >
              {row.getIsExpanded() ? (
                <ChevronUp
                  className="opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown
                  className="opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              )}
            </Button>
          ) : undefined;
        },
      },
      {
        id: "select",
        size: 44,
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
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            disabled={!row.original.parentId}
            aria-label="Select row"
          />
        ),
      },
      {
        header: "Categoria",
        accessorKey: "name",
        cell: ({ row }) => {
          const color = row.original.color;
          const icon = row.original.icon;

          return (
            <div className="flex items-center gap-2 font-medium">
              <Badge
                variant="outline"
                style={{
                  border: `1px solid hsl(${color})`,
                  color: `hsl(${color})`,
                }}
              >
                <DynamicIcon name={icon as keyof typeof dynamicIconImports} />
                {row.getValue("name")}
              </Badge>
            </div>
          );
        },
      },
      {
        header: "Slug",
        accessorKey: "slug",
        cell: ({ row }) => (
          <div className="font-mono text-muted-foreground">
            {row.getValue("slug")}
          </div>
        ),
      },
      {
        header: "Parent",
        accessorKey: "parentId",
        cell: ({ row }) => {
          const parent = categories.find(
            (c) => c.id === row.getValue("parentId"),
          );

          return parent ? (
            <Badge asChild variant="outline">
              <a href="#">
                {parent.name} <ArrowRightIcon />
              </a>
            </Badge>
          ) : (
            <div className="text-muted-foreground italic">root category</div>
          );
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
                <DropdownMenuItem className="text-destructive">
                  <Trash2Icon /> Elimina selezionati
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        cell: () => (
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
              <DropdownMenuItem className="text-destructive">
                Elimina movimento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [categories, rowSelection],
  );

  const table = useReactTable({
    data: categories,
    columns,
    getRowCanExpand: (row) => Boolean(row),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id, //use the row's uuid from your database as the row id
    state: {
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="relative">
          <Input
            placeholder="Cerca categorie..."
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
        <Button onClick={() => setOpen("")}>
          <PlusIcon />
          Crea Categoria
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
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
                <Fragment key={row.id}>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap [&:has([aria-expanded])]:w-px [&:has([aria-expanded])]:py-0 [&:has([aria-expanded])]:pr-0"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length}>
                        <div className="ml-[96px] flex items-start py-2 text-primary/80">
                          <ul className="flex w-full flex-col gap-2">
                            TODO budgets here
                          </ul>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
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
    </div>
  );
}
