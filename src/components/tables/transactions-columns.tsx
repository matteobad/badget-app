"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { cn, euroFormat } from "~/lib/utils";
import { type getUserTransactions } from "~/server/db/queries/cached-queries";
import { Checkbox } from "../ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export type Transaction = Awaited<
  ReturnType<typeof getUserTransactions>
>[number];

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return format(new Date(row.original.date!), "dd MMM yyyy");
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <TooltipProvider delayDuration={20}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  row.original?.category === "income" && "text-[#00C969]",
                )}
              >
                <div className="flex items-center space-x-2">
                  <span className="line-clamp-1 max-w-[100px] text-ellipsis md:max-w-none">
                    {row.original.name}
                  </span>

                  {row.original.status === "pending" && (
                    <div className="flex h-[22px] items-center space-x-1 rounded-md border px-2 py-1 text-xs text-[#878787]">
                      <span>Pending</span>
                    </div>
                  )}
                </div>
              </span>
            </TooltipTrigger>
            {row.original?.description && (
              <TooltipContent
                className="max-w-[380px] px-3 py-1.5 text-xs"
                side="left"
                sideOffset={10}
              >
                {row.original.description}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return (
        <span
          className={cn(
            "text-sm",
            row.original?.category === "income" && "text-[#00C969]",
          )}
        >
          {euroFormat(row.original.amount!)}
        </span>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <span>{row.original?.category}</span>;
    },
  },
];
