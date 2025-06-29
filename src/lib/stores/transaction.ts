import { create } from "zustand";

import type { Column, RowSelectionState, Updater } from "@tanstack/react-table";

interface TransactionsState {
  canDelete?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: Column<any, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setColumns: (columns?: Column<any, unknown>[]) => void;
  setCanDelete: (canDelete?: boolean) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
}

export const useTransactionsStore = create<TransactionsState>()((set) => ({
  columns: [],
  canDelete: false,
  rowSelection: {},
  setCanDelete: (canDelete) => set({ canDelete }),
  setColumns: (columns) => set({ columns: columns ?? [] }),
  setRowSelection: (updater: Updater<RowSelectionState>) =>
    set((state) => {
      return {
        rowSelection:
          typeof updater === "function" ? updater(state.rowSelection) : updater,
      };
    }),
}));
