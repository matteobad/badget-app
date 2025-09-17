// TODO: Remove this import once we have a better way to type the table meta
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { RouterOutputs } from "@/trpc/client";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    // Transaction table meta
    dateFormat?: string | null;
    timeFormat?: number | null;
    hasSorting?: boolean;
    setOpen?: (id: string) => void;
    copyUrl?: (id: string) => void;
    splitTransaction?: (id: string) => void;
    deleteTransactionSplit?: (id: string) => void;
    deleteTransaction?: (id: string) => void;

    // Categories table meta
    createSubCategory?: (id: string) => void;
    deleteCategory?: (id: string) => void;
    expandedCategories?: Set<string>;
    setExpandedCategories?: React.Dispatch<React.SetStateAction<Set<string>>>;

    // Bank Account table meta
    deleteBankAccount?: (id: string) => void;

    // Tag table meta
    deleteTag?: (id: string) => void;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}
