import type { Widget } from "~/server/domain/preferences/queries";

export const INITIAL_WIDGETS: Widget[] = [
  {
    id: "insights",
  },
  {
    id: "income",
  },
  {
    id: "category-expenses",
  },
  {
    id: "uncategorized",
  },
  {
    id: "monthly-spending",
  },
  {
    id: "net-worth",
  },
  {
    id: "recurring",
  },
  {
    id: "income-analysis",
  },
  {
    id: "taxes",
  },
  {
    id: "top-customers",
  },
  {
    id: "profit-margin",
  },
  {
    id: "cash-flow",
  },
  {
    id: "growth-rate",
  },
  {
    id: "payroll",
  },
] as const;
