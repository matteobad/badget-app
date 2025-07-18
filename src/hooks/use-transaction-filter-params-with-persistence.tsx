"use client";

import type {
  FilterHookReturn,
  TransactionFilters,
} from "~/shared/helpers/transacion-filters";
import { EMPTY_FILTER_STATE } from "~/shared/helpers/transacion-filters";

import { useGenericFilterPersistence } from "./use-generic-filter-persistence";
import { useTransactionFilterParams } from "./use-transaction-filter-params";

export function useTransactionFilterParamsWithPersistence(): FilterHookReturn<TransactionFilters> {
  const { filter, setFilter, hasFilters } = useTransactionFilterParams();

  const { clearAllFilters } = useGenericFilterPersistence({
    storageKey: "transaction-filters",
    emptyState: EMPTY_FILTER_STATE,
    currentFilters: filter,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setFilters: setFilter,
  });

  return {
    filter,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setFilter,
    hasFilters,
    clearAllFilters,
  };
}
