// TODO: Remove this import once we have a better way to type the table meta

import type { RouterOutput } from "~/server/api/trpc/routers/_app";

declare module "@tanstack/react-table" {
  // biome-ignore lint: disable biome
  interface TableMeta<TData extends RowData> {
    // Transaction table meta
    dateFormat?: string | null;
    timeFormat?: number | null;
    hasSorting?: boolean;
    setOpen?: (id: string) => void;
    copyUrl?: (id: string) => void;
    updateTransaction?: (data: {
      id: string;
      status?: string;
      categorySlug?: string | null;
      categoryName?: string;
      assignedId?: string | null;
    }) => void;
    splitTransaction?: (id: string) => void;
    deleteTransactionSplit?: (id: string) => void;
    deleteTransaction?: (id: string) => void;
    editTransaction?: (id: string) => void;

    // Categories table meta
    createSubCategory?: (id: string) => void;
    deleteCategory?: (id: string) => void;
    expandedCategories?: Set<string>;
    setExpandedCategories?: React.Dispatch<React.SetStateAction<Set<string>>>;

    // Bank Account table meta
    deleteBankAccount?: (id: string) => void;

    // Tag table meta
    deleteTag?: (id: string) => void;

    // Members table meta
    currentUser?: RouterOutput["space"]["listMembers"]["members"][number];
    totalOwners?: number;
  }

  // biome-ignore lint: disable biome
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}
