"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";

export type Tag = RouterOutput["tag"]["get"][number];

export const columns: ColumnDef<Tag>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => {
      return (
        <div className={cn("flex items-center space-x-2")}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">{row.getValue("name")}</span>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [, setIsEditOpen] = useState(false);

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <EllipsisIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => table.options.meta?.deleteTag?.(row.original.id)}
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
