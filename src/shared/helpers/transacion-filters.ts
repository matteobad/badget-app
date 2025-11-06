import type { TransactionFrequencyType } from "../constants/enum";

// Type for transaction filters based on the schema
export type TransactionFilters = {
  q?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
  accounts?: string[] | null;
  type?: "income" | "expense" | null;
  start?: string | null;
  end?: string | null;
  recurring?: (TransactionFrequencyType | "all")[] | null;
  amountRange?: number[] | null;
  amount?: string[] | null;
  manual?: "include" | "exclude" | null;
  reporting?: "include" | "exclude" | null;
};

// Generic filter state type
export type FilterState = Record<string, any>;

// Hook return type for consistency across all filter hooks
export type FilterHookReturn<T = FilterState> = {
  filter: T;
  setFilter: (filters: T) => void;
  hasFilters: boolean;
  clearAllFilters: () => void;
};

// Default empty filter state
export const EMPTY_FILTER_STATE: TransactionFilters = {
  q: null,
  categories: null,
  tags: null,
  accounts: null,
  type: null,
  start: null,
  end: null,
  recurring: null,
  amountRange: null,
  amount: null,
  manual: null,
  reporting: null,
};

/**
 * Check if a single filter value is active (has meaningful content)
 */
export function isFilterValueActive(value: any): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Check if a filter object has any active filters
 */
export function hasActiveFilters(filters: Record<string, any>): boolean {
  return Object.values(filters).some(isFilterValueActive);
}

/**
 * Clean filters by removing null/undefined/empty values
 */
export function cleanFilters(
  filters: Record<string, any>,
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => isFilterValueActive(value)),
  );
}

/**
 * Compare two filter objects for equality
 */
export function areFiltersEqual(
  filters1: Record<string, any>,
  filters2: Record<string, any>,
): boolean {
  const normalize = (filters: Record<string, any>) => {
    const cleaned = cleanFilters(filters);
    return JSON.stringify(cleaned, Object.keys(cleaned).sort());
  };

  return normalize(filters1) === normalize(filters2);
}

/**
 * Check if URL params contain any active filters
 */
export function hasActiveUrlFilters(urlFilters: Record<string, any>): boolean {
  return hasActiveFilters(urlFilters);
}

/**
 * Create an empty filter state for any entity
 */
export function createEmptyFilterState<T extends Record<string, any>>(
  keys: (keyof T)[],
): T {
  return keys.reduce((acc, key) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (acc as any)[key] = null;
    return acc;
  }, {} as T);
}
