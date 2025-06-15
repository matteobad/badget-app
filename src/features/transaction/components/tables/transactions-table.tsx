"use client";

import type { dynamicIconImports } from "lucide-react/dynamic";
import { use, useMemo, useState } from "react";
import { DataTable } from "~/components/data-table/data-table";
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { type getAccounts_CACHED } from "~/features/account/server/cached-queries";
import { type getTags_CACHED } from "~/features/category/server/cached-queries";
import { type getCategories_QUERY } from "~/features/category/server/queries";
import ImportTransactionDrawerDialog from "~/features/transaction/components/import-transaction-drawer-dialog";
import { useDataTable } from "~/hooks/use-data-table";
import {
  type DataTableAction,
  type DataTableFilterField,
  type DataTableRowAction,
} from "~/utils/data-table";
import { CircleDashed, Wallet2Icon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

import {
  type getTransactionAccountCounts_CACHED,
  type getTransactionCategoryCounts_CACHED,
  type getTransactions_CACHED,
  type getTransactionTagCounts_CACHED,
} from "../../server/cached-queries";
import CreateTransactionDrawerSheet from "../create-transaction-drawer-sheet";
import { DeleteTransactionsDialog } from "../delete-transactions-dialog";
import UpdateTransactionDrawerSheet from "../update-transaction-drawer-sheet";
import { getColumns } from "./transactions-table-columns";
import { TransactionsTableFloatingBar } from "./transactions-table-floating-bar";
import { TransactionsTableToolbarActions } from "./transactions-table-toolbar-action";

export type TransactionType = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];

interface TransactionsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getTransactions_CACHED>>,
      Awaited<ReturnType<typeof getTransactionCategoryCounts_CACHED>>,
      Awaited<ReturnType<typeof getTransactionTagCounts_CACHED>>,
      Awaited<ReturnType<typeof getTransactionAccountCounts_CACHED>>,
      Awaited<ReturnType<typeof getCategories_QUERY>>,
      Awaited<ReturnType<typeof getTags_CACHED>>,
      Awaited<ReturnType<typeof getAccounts_CACHED>>,
    ]
  >;
}

export function TransactionsTable({ promises }: TransactionsTableProps) {
  const [
    { data, pageCount },
    categoryCounts,
    tagCounts,
    accountCounts,
    categories,
    tags,
    accounts,
  ] = use(promises);

  console.log("tags", tags);

  const [rowAction, setRowAction] =
    useState<DataTableRowAction<TransactionType> | null>(null);
  const [tableAction, setTableAction] = useState<DataTableAction | null>(null);

  const columns = useMemo(
    () => getColumns({ accounts, categories, setRowAction }),
    [accounts, categories],
  );

  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
  const filterFields: DataTableFilterField<TransactionType>[] = [
    {
      id: "description",
      label: "Descrizione",
      type: "text",
      placeholder: "Cerca o filtra",
    },
    {
      id: "date",
      label: "Data",
      type: "date",
    },
    {
      id: "amount",
      label: "Importo",
      type: "number",
      values: data.map((item) => item.amount),
    },
    {
      id: "categoryId",
      label: "Categoria",
      type: "multi-select",
      options: [
        ...categories.map((category) => ({
          label: category.name,
          value: category.id,
          icon: () => (
            <DynamicIcon
              className="mr-2 size-3.5"
              name={category.icon as keyof typeof dynamicIconImports}
            />
          ),
          count: categoryCounts[category.id],
        })),
        {
          label: "Uncategorized",
          value: "null",
          icon: () => <CircleDashed className="mr-2 size-3.5" />,
          count: categoryCounts.null,
        },
      ],
    },
    {
      id: "tags",
      label: "Tags",
      type: "multi-select",
      options: tags.map((tag) => ({
        label: tag.text,
        value: tag.id,
        count: tagCounts[tag.id],
      })),
    },
    {
      id: "accountId",
      label: "Conto",
      type: "multi-select",
      options: accounts.map((account) => ({
        label: account.name,
        value: account.id,
        icon: () => (
          <Avatar className="mr-2 size-4">
            <AvatarImage
              src={account.logoUrl!}
              alt={`${account.name} logo`}
            ></AvatarImage>
            <AvatarFallback>
              <Wallet2Icon className="size-3" />
            </AvatarFallback>
          </Avatar>
        ),
        count: accountCounts[account.id],
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
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable
        table={table}
        floatingBar={
          <TransactionsTableFloatingBar table={table} categories={categories} />
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <TransactionsTableToolbarActions
            table={table}
            setTableAction={setTableAction}
          />
        </DataTableToolbar>
      </DataTable>
      <CreateTransactionDrawerSheet
        open={tableAction?.type === "create"}
        onOpenChange={() => setTableAction(null)}
        accounts={accounts}
        categories={categories}
      />
      <ImportTransactionDrawerDialog
        open={tableAction?.type === "import"}
        onOpenChange={() => setTableAction(null)}
        accounts={accounts}
      />
      <UpdateTransactionDrawerSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        accounts={accounts}
        categories={categories}
        transaction={rowAction?.row.original ?? null}
      />
      <DeleteTransactionsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        tasks={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
}
