"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { differenceInDays } from "date-fns";
import {
  AlertTriangleIcon,
  CheckIcon,
  ClockIcon,
  Columns3Icon,
  FilterIcon,
  LoaderIcon,
  MoreHorizontal,
} from "lucide-react";
import { useQueryStates } from "nuqs";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
import { ConnectionStatus } from "~/server/db/schema/enum";
import { formatAmount } from "~/utils/format";
import { type getConnectionsWithAccountsForUser } from "../server/queries";
import { connectionsParsers } from "../utils/search-params";
import { AddConnectionButton } from "./add-connection-button";

type ConnectionWithAccounts = Awaited<
  ReturnType<typeof getConnectionsWithAccountsForUser>
>[number];

export default function ConnectionDataTable({
  connections,
}: {
  connections: ConnectionWithAccounts[];
}) {
  const [, setParams] = useQueryStates(connectionsParsers);

  const columns: ColumnDef<ConnectionWithAccounts>[] = useMemo(
    () => [
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
        cell: ({ row }) => (
          <div className="font-mono text-muted-foreground">
            {row.getValue("provider")?.toString().toLowerCase()}
          </div>
        ),
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
        cell: ({ row }) => {
          const status: ConnectionStatus = row.getValue("status");
          return (
            <Badge
              // @ts-expect-error bad typing
              variant={
                {
                  [ConnectionStatus.LINKED]: "default",
                  [ConnectionStatus.EXPIRED]: "secondary",
                  [ConnectionStatus.ERROR]: "destructive",
                  [ConnectionStatus.PENDING]: "outline",
                  [ConnectionStatus.UNKNOWN]: "outline",
                  [ConnectionStatus.CREATED]: "outline",
                }[status]
              }
            >
              {
                {
                  [ConnectionStatus.LINKED]: <CheckIcon />,
                  [ConnectionStatus.EXPIRED]: <ClockIcon />,
                  [ConnectionStatus.ERROR]: <AlertTriangleIcon />,
                  [ConnectionStatus.PENDING]: <LoaderIcon />,
                  [ConnectionStatus.UNKNOWN]: <LoaderIcon />,
                  [ConnectionStatus.CREATED]: <LoaderIcon />,
                }[status]
              }
              {status}
            </Badge>
          );
        },
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
        header: "",
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
                Elimina account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: connections,
    columns,
    getRowCanExpand: (row) => Boolean(row.original.accounts.length),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: (row) => row.id, //use the row's uuid from your database as the row id
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="relative">
          <Input
            placeholder="Cerca connessione..."
            value={
              (table.getColumn("institution")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("institution")?.setFilterValue(event.target.value)
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

        <AddConnectionButton label="Aggiungi conto" />
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => setParams({ id: row.id })}
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
