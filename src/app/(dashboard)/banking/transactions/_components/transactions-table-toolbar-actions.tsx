"use client";

// import { type Task } from "@/db/schema";
// import { exportTableToCSV } from "@/lib/export";
import { type Table } from "@tanstack/react-table";
import { DownloadIcon } from "lucide-react";

import { DateRangePicker } from "~/components/data-range-picker";
import { Button } from "~/components/ui/button";
import { AddTransactionButton } from "./add-transaction-button";
import { type Transaction } from "./transactions-table";

// import { CreateTaskDialog } from "./create-task-dialog";
// import { DeleteTasksDialog } from "./delete-tasks-dialog";

interface TasksTableToolbarActionsProps {
  table: Table<Transaction>;
}

export function TasksTableToolbarActions({
  table,
}: TasksTableToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteTasksDialog
          tasks={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <CreateTaskDialog /> */}
      <DateRangePicker
        triggerSize="sm"
        triggerClassName="ml-auto w-56 sm:w-60"
        align="end"
      />

      {/**
       * Other actions can be added here.
       * For example, import, view, etc.
       */}
    </div>
  );
}
