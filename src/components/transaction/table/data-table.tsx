"use client";

import type { TransactionStatusType } from "~/server/db/schema/enum";
import { use, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useMutation, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { LoadMore } from "~/components/load-more";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { Tooltip, TooltipProvider } from "~/components/ui/tooltip";
import { useSortParams } from "~/hooks/use-sort-params";
import { useStickyColumns } from "~/hooks/use-sticky-columns";
import { useTableScroll } from "~/hooks/use-table-scroll";
import { useTransactionFilterParamsWithPersistence } from "~/hooks/use-transaction-filter-params-with-persistence";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { useTransactionsStore } from "~/lib/stores/transaction";
import { cn } from "~/lib/utils";
import { updateColumnVisibilityAction } from "~/server/actions";
import { Cookies } from "~/shared/constants/cookies";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { AnimatePresence } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

import type { VisibilityState } from "@tanstack/react-table";
import { BottomBar } from "./bottom-bar";
import { columns } from "./columns";
import { DataTableHeader } from "./data-table-header";
import { NoResults, NoTransactions } from "./empty-states";
import { ExportBar } from "./export-bar";
import { Loading } from "./loading";

type Props = {
  columnVisibility: Promise<VisibilityState>;
};

export function DataTable({
  columnVisibility: columnVisibilityPromise,
}: Props) {
  const trpc = useTRPC();
  const { filter, hasFilters } = useTransactionFilterParamsWithPersistence();
  const { setRowSelection, rowSelection, setColumns, setCanDelete } =
    useTransactionsStore();
  const deferredSearch = useDeferredValue(filter.q);
  const { params } = useSortParams();
  const { ref, inView } = useInView();
  const { params: transactionParams, setParams } = useTransactionParams();

  const transactionId = transactionParams.transactionId;
  const showBottomBar = hasFilters && !Object.keys(rowSelection).length;
  const initialColumnVisibility = use(columnVisibilityPromise);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {},
  );

  const infiniteQueryOptions = trpc.transaction.get.infiniteQueryOptions(
    {
      ...filter,
      q: deferredSearch,
      sort: params.sort,
    },
    {
      getNextPageParam: ({ meta }) => meta?.cursor,
    },
  );

  const { data, fetchNextPage, hasNextPage, refetch } =
    useSuspenseInfiniteQuery(infiniteQueryOptions);

  const updateTransactionMutation = useMutation(
    trpc.transaction.update.mutationOptions({
      onSuccess: () => {
        void refetch();
        toast.success("Transaction updated");
      },
    }),
  );

  const deleteTransactionMutation = useMutation(
    trpc.transaction.delete.mutationOptions({
      onSuccess: () => {
        void refetch();
      },
    }),
  );

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  const tableData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const ids = useMemo(() => {
    return tableData.map((row) => row?.id);
  }, [tableData]);

  const table = useReactTable({
    getRowId: (row) => row?.id,
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      rowSelection,
      columnVisibility,
    },
    meta: {
      setOpen: (id: string) => {
        void setParams({ transactionId: id });
      },
      copyUrl: (id: string) => {
        try {
          void window.navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/transactions/?transactionId=${id}`,
          );
          toast.success("Transaction URL copied to clipboard");
        } catch {
          toast.error("Failed to copy transaction URL to clipboard");
        }
      },
      updateTransaction: (data: { id: string; status: string }) => {
        updateTransactionMutation.mutate({
          id: data.id,
          status: data.status as TransactionStatusType,
        });
      },
      onDeleteTransaction: (id: string) => {
        deleteTransactionMutation.mutate({ id });
      },
    },
  });

  // Use the reusable sticky columns hook
  const { getStickyStyle, getStickyClassName } = useStickyColumns({
    columnVisibility,
    table,
  });

  // Use the reusable table scroll hook with column-width scrolling starting after sticky columns
  const tableScroll = useTableScroll({
    useColumnWidths: true,
    startFromColumn: 3, // Skip sticky columns: select, date, description
  });

  useEffect(() => {
    setColumns(table.getAllLeafColumns());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnVisibility]);

  useEffect(() => {
    void updateColumnVisibilityAction({
      key: Cookies.TransactionsColumns,
      data: columnVisibility,
    });
  }, [columnVisibility]);

  useEffect(() => {
    const transactions = tableData.filter((transaction) => {
      if (!transaction?.id) return false;
      const found = rowSelection[transaction.id];

      if (found) {
        return !transaction?.manual;
      }
      return false;
    });

    if (Object.keys(rowSelection)?.length > 0) {
      if (transactions.length === 0) {
        setCanDelete(true);
      } else {
        setCanDelete(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  useHotkeys(
    "ArrowUp, ArrowDown",
    ({ key }) => {
      if (key === "ArrowUp" && transactionId) {
        const currentIndex = ids?.indexOf(transactionId) ?? 0;
        const prevId = ids[currentIndex - 1];

        if (prevId) {
          void setParams({ transactionId: prevId });
        }
      }

      if (key === "ArrowDown" && transactionId) {
        const currentIndex = ids?.indexOf(transactionId) ?? 0;
        const nextId = ids[currentIndex + 1];

        if (nextId) {
          void setParams({ transactionId: nextId });
        }
      }
    },
    { enabled: !!transactionId },
  );

  if (!tableData.length && !hasFilters) {
    return (
      <div className="relative h-[calc(100vh-200px)] overflow-hidden">
        <NoTransactions />
        <Loading isEmpty />
      </div>
    );
  }

  if (!tableData.length && hasFilters) {
    return (
      <div className="relative h-[calc(100vh-200px)] overflow-hidden">
        <NoResults />
        <Loading isEmpty />
      </div>
    );
  }

  return (
    <div className="relative">
      <TooltipProvider delayDuration={20}>
        <Tooltip>
          <div className="w-full">
            <div
              ref={tableScroll.containerRef}
              className="scrollbar-hide overflow-x-auto overscroll-x-none border-y border-border"
            >
              <Table>
                <DataTableHeader table={table} tableScroll={tableScroll} />

                <TableBody className="border-r-0 border-l-0">
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="group h-[40px] cursor-pointer select-text hover:bg-[#F2F1EF] md:h-[45px] hover:dark:bg-secondary"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              getStickyClassName(
                                cell.column.id,
                                // @ts-expect-error - TODO: fix this
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                                cell.column.columnDef.meta?.className,
                              ),
                              "py-4",
                            )}
                            style={getStickyStyle(cell.column.id)}
                            onClick={() => {
                              if (
                                cell.column.id !== "select" &&
                                cell.column.id !== "actions"
                              ) {
                                void setParams({
                                  transactionId: row.original.id,
                                });
                              }
                            }}
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

            <LoadMore ref={ref} hasNextPage={hasNextPage} />
          </div>
        </Tooltip>
      </TooltipProvider>

      <ExportBar />

      <AnimatePresence>{showBottomBar && <BottomBar />}</AnimatePresence>
    </div>
  );
}
