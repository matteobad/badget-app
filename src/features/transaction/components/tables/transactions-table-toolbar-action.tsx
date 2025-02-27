"use client";

import type { Table } from "@tanstack/react-table";
import { DownloadIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { exportTableToCSV } from "~/utils/export";
import { type getTransactions_CACHED } from "../../server/cached-queries";

export type TransactionType = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];

export function TransactionsTableToolbarActions({
  table,
}: {
  table: Table<TransactionType>;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteTasksDialog
          tasks={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null} */}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "transactions",
            excludeColumns: ["select", "actions"],
          })
        }
        className="gap-2"
      >
        <DownloadIcon className="size-4" aria-hidden="true" />
        Export
      </Button>
      {/**
       * Other actions can be added here.
       * For example, import, view, etc.
       */}
    </div>
  );
}
