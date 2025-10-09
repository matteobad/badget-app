import { useQueryStates } from "nuqs";
import { parseAsString } from "nuqs/server";
import { useCallback } from "react";

// Default empty filter state
export const EMPTY_FILTER_STATE = {
  q: null,
};

export const bankAccountFilterParamsSchema = {
  q: parseAsString,
};

export function useBankAccountFilterParams() {
  const [filters, setFilters] = useQueryStates(bankAccountFilterParamsSchema, {
    // Clear URL when values are null/default
    clearOnDefault: true,
  });

  // Clear all filters helper
  const clearAllFilters = useCallback(() => {
    void setFilters(EMPTY_FILTER_STATE);
  }, [setFilters]);

  return {
    filters,
    setFilters,
    hasFilters: Object.values(filters).some((value) => value !== null),
    clearAllFilters,
  };
}
