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
    id: "recurring-tracker",
  },
  {
    id: "uncategorized-transactions",
  },
  {
    id: "income-analysis",
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
