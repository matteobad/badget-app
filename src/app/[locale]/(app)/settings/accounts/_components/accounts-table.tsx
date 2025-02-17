"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Fragment, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { differenceInDays } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  DownloadIcon,
  Info,
  MoreHorizontal,
  Trash2Icon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { type QUERIES } from "~/server/db/queries";
import { ConnectionStatus } from "~/server/db/schema/enum";
import { formatAmount } from "~/utils/format";

type ConnectionWithAccounts = Awaited<
  ReturnType<typeof QUERIES.getAccountsWithConnectionsForUser>
>[number];

export default function AccountDataTable({
  connections,
}: {
  connections: ConnectionWithAccounts[];
}) {
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<ConnectionWithAccounts>[] = useMemo(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <Button
              {...{
                className: "size-7 shadow-none text-muted-foreground",
                onClick: row.getToggleExpandedHandler(),
                "aria-expanded": row.getIsExpanded(),
                "aria-label": row.getIsExpanded()
                  ? `Collapse details for ${row.original.institution.name}`
                  : `Expand details for ${row.original.institution.name}`,
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
            aria-label="Select row"
          />
        ),
      },
      {
        header: "Istituto Bancario",
        accessorKey: "institution",
        cell: ({ row }) => {
          const institution: ConnectionWithAccounts["institution"] =
            row.getValue("institution");

          return (
            <div className="flex items-center gap-2 font-medium">
              <Avatar className="size-5">
                <AvatarImage
                  src={institution.logo!}
                  alt={`${institution.name} logo`}
                ></AvatarImage>
                <AvatarFallback>IB</AvatarFallback>
              </Avatar>
              {institution.name}
            </div>
          );
        },
      },
      {
        header: "Provider",
        accessorKey: "provider",
      },
      {
        header: "Validità",
        accessorKey: "validUntil",
        cell: ({ row }) => {
          return (
            <div>
              {differenceInDays(row.getValue("validUntil"), new Date())} giorni
            </div>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <Badge
            className={cn(
              row.getValue("status") === ConnectionStatus.EXPIRED &&
                "bg-muted-foreground/60 text-primary-foreground",
            )}
          >
            {row.getValue("status")}
          </Badge>
        ),
      },
      {
        header: () => <div className="text-right">Balance</div>,
        accessorKey: "accounts",
        cell: ({ row }) => {
          const accounts: ConnectionWithAccounts["accounts"] =
            row.getValue("accounts");
          const totalBalance = accounts.reduce((acc, value) => {
            acc += parseFloat(value.balance);
            return acc;
          }, 0);

          return (
            <div className="text-right">
              {formatAmount({ amount: totalBalance })}
            </div>
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
    [rowSelection],
  );

  const table = useReactTable({
    data: connections,
    columns,
    getRowCanExpand: (row) => Boolean(row.original.accounts.length),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onRowSelectionChange: setRowSelection,
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
                      <div className="flex items-start py-2 text-primary/80">
                        <span
                          className="me-3 mt-0.5 flex w-7 shrink-0 justify-center"
                          aria-hidden="true"
                        >
                          <Info
                            className="opacity-60"
                            size={16}
                            strokeWidth={2}
                          />
                        </span>
                        <p className="text-sm">
                          {row.original.accounts.length}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
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
      </Table>
    </div>
  );
}
