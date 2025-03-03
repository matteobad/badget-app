"use client";

import type { Table } from "@tanstack/react-table";
import { type Dispatch, type SetStateAction } from "react";
import { ImportIcon, PlusIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { type DataTableAction } from "~/utils/data-table";
import { type getTransactions_CACHED } from "../../server/cached-queries";

export type TransactionType = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];

export function TransactionsTableToolbarActions({
  setTableAction,
}: {
  table: Table<TransactionType>;
  setTableAction: Dispatch<SetStateAction<DataTableAction | null>>;
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
      {/* <Button
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
      </Button> */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTableAction({ type: "import" })}
        className="gap-2"
      >
        <ImportIcon className="size-4" aria-hidden="true" />
        <span className="hidden lg:flex">Importa</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => setTableAction({ type: "create" })}
        className="gap-2"
      >
        <PlusIcon className="size-4" aria-hidden="true" />
        <span className="hidden lg:flex">Aggiungi</span>
      </Button>
      {/**
       * Other actions can be added here.
       * For example, export, view, etc.
       */}
    </div>
  );
}
