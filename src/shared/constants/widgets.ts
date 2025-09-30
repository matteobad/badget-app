import type { Widget } from "~/server/domain/preferences/queries";

export const INITIAL_WIDGETS: Widget[] = [
  {
    id: "insights",
  },
  {
    id: "net-worth",
  },
  {
    id: "income",
  },
  {
    id: "monthly-spending",
  },
  {
    id: "category-expenses",
  },
  {
    id: "recurring-expenses",
  },
  {
    id: "uncategorized-transactions",
  },
  {
    id: "savings",
  },
  {
    id: "average-expenses",
  },
  {
    id: "biggest-transactions",
  },
  {
    id: "cash-flow",
  },
  {
    id: "savings-rate",
  },
  {
    id: "account-balances",
  },
] as const;

// Widget polling configuration
export const WIDGET_POLLING_CONFIG = {
  refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
  staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
} as const;
