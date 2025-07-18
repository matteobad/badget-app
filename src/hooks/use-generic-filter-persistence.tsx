import { useCallback, useEffect } from "react";
import {
  cleanFilters,
  hasActiveUrlFilters,
} from "~/shared/helpers/transacion-filters";

import { useFilterLocalStorage } from "./use-local-storage";

type UseFilterPersistenceOptions<T> = {
  storageKey: string;
  emptyState: T;
  currentFilters: T;
  setFilters: (filters: T) => void;
};

/**
 * Generic hook for persisting any kind of filters to localStorage
 * Can be reused for transactions, invoices, customers, etc.
 */
export function useGenericFilterPersistence<T extends Record<string, unknown>>({
  storageKey,
  emptyState,
  currentFilters,
  setFilters,
}: UseFilterPersistenceOptions<T>) {
  const { initializeFromStorage, saveToStorage } = useFilterLocalStorage<T>({
    key: storageKey,
    serialize: (filters) => JSON.stringify(cleanFilters(filters)),
    shouldSave: (filters) => Object.keys(cleanFilters(filters)).length > 0,
  });

  // Initialize from localStorage on mount (only if URL is empty)
  useEffect(() => {
    initializeFromStorage(
      (savedFilters: T) => setFilters(savedFilters),
      () => !hasActiveUrlFilters(currentFilters),
    );
  }, [initializeFromStorage, setFilters, currentFilters]);

  // Save changes to localStorage
  useEffect(() => {
    saveToStorage(currentFilters);
  }, [currentFilters, saveToStorage]);

  // Clear all filters helper
  const clearAllFilters = useCallback(() => {
    setFilters(emptyState);
  }, [setFilters, emptyState]);

  return {
    clearAllFilters,
  };
}

// Example usage for other entities:
//
// For invoices:
// export function useInvoiceFilterPersistence() {
//   const { filter, setFilter, hasFilters } = useInvoiceFilterParams();
//   const { clearAllFilters } = useGenericFilterPersistence({
//     storageKey: "invoice-filters",
//     emptyState: EMPTY_INVOICE_FILTER_STATE,
//     currentFilters: filter,
//     setFilters: setFilter,
//   });
//   return { filter, setFilter, hasFilters, clearAllFilters };
// }
//
// For customers:
// export function useCustomerFilterPersistence() {
//   const { filter, setFilter, hasFilters } = useCustomerFilterParams();
//   const { clearAllFilters } = useGenericFilterPersistence({
//     storageKey: "customer-filters",
//     emptyState: EMPTY_CUSTOMER_FILTER_STATE,
//     currentFilters: filter,
//     setFilters: setFilter,
//   });
//   return { filter, setFilter, hasFilters, clearAllFilters };
// }
