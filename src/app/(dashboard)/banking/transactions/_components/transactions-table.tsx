"use client";

import type dynamicIconImports from "lucide-react/dynamicIconImports";
import * as React from "react";

import type {
  getFilteredTransactions,
  getUserBankAccounts,
} from "~/server/db/queries/cached-queries";
import { DataTable } from "~/components/tables/data-tables";
import { type DataTableFilterField } from "~/configs/data-table";
import { useDataTable } from "~/hooks/use-data-table";
import { type getUserCategories } from "~/server/db/queries/cached-queries";
import { DataTableToolbar } from "./data-table-toolbar";
import { getColumns } from "./transactions-table-columns";
import { TasksTableToolbarActions } from "./transactions-table-toolbar-actions";

export type Transaction = Awaited<
  ReturnType<typeof getFilteredTransactions>
>["data"][number];

export type Category = Awaited<ReturnType<typeof getUserCategories>>[number];
export type Account = Awaited<ReturnType<typeof getUserBankAccounts>>[number];

export function TransactionsTable({
  data,
  pageCount,
  categories,
  accounts,
}: {
  data: Transaction[];
  pageCount: number;
  categories: Category[];
  accounts: Account[];
}) {
  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo(() => getColumns(), []);

  const filterFields: DataTableFilterField<Transaction>[] = [
    {
      label: "Title",
      value: "description",
      placeholder: "Cerca transazioni...",
    },
    {
      label: "Categoria",
      value: "category",
      options: categories.map((category) => ({
        label: category.name,
        value: category.id.toString(),
        icon: category.icon as keyof typeof dynamicIconImports,
        withCount: true,
      })),
    },
    {
      label: "Conto",
      value: "bankAccount",
      options: accounts.map((account) => ({
        label: account.name,
        value: account.id.toString(),
        // icon: category.icon as keyof typeof dynamicIconImports,
        withCount: true,
      })),
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: {
      sorting: [{ id: "date", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    // For remembering the previous row selection on page change
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} filterFields={filterFields}>
        <TasksTableToolbarActions table={table} />
      </DataTableToolbar>
    </DataTable>
  );
}
