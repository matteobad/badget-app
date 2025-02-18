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
  AlertTriangleIcon,
  CheckIcon,
  ChevronDown,
  ChevronUp,
  ClockIcon,
  Columns3Icon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FilterIcon,
  LoaderIcon,
  MoreHorizontal,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { toggleAccountAction } from "~/server/actions";
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
    getRowId: (row) => row.id, //use the row's uuid from your database as the row id
    state: {
      rowSelection,
    },
  });

  const { execute, isExecuting } = useAction(toggleAccountAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      console.log(data?.message);
      toast.success("Account toggled!");
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="relative">
          <Input
            placeholder="Cerca conti..."
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
      </div>
      <div className="rounded-md border">
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
                        <div className="ml-[96px] flex items-start py-2 text-primary/80">
                          <ul className="flex w-full flex-col gap-2">
                            {row.original.accounts.map((account) => {
                              return (
                                <li
                                  className="flex w-full items-center justify-between"
                                  key={account.id}
                                >
                                  <div>{account.name}</div>
                                  <div>
                                    <div className="flex items-center gap-4">
                                      <div>
                                        {formatAmount({
                                          amount: parseFloat(account.balance),
                                        })}
                                      </div>

                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            className="relative h-8 w-8 p-0"
                                          >
                                            <span className="sr-only">
                                              Open menu
                                            </span>
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem>
                                            <PencilIcon />
                                            Modifica
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <FileSpreadsheetIcon />
                                            Importa
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-destructive">
                                            <Trash2Icon /> Rimuovi
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                      <div>
                                        <Switch
                                          id="airplane-mode"
                                          disabled={isExecuting}
                                          checked={account.enabled}
                                          onCheckedChange={(checked) =>
                                            execute({
                                              id: account.id,
                                              enabled: checked,
                                            })
                                          }
                                        />
                                        <Label
                                          htmlFor="airplane-mode"
                                          className="sr-only"
                                        >
                                          Status
                                        </Label>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
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
