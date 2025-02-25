export const Provider = {
  GOCARDLESS: "GOCARDLESS",
  PLAID: "PLAID",
  TELLER: "TELLER",
  NONE: "NONE",
} as const;
export type Provider = (typeof Provider)[keyof typeof Provider];

export const AccountType = {
  CHECKING: "checking",
  SAVINGS: "savings",
  INVESTMENTS: "investment",
  DEBT: "debt",
  CASH: "cash",
  OTHER: "other",
} as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];

// TODO: reduce possible status
export const CONNECTION_STATUS = {
  PENDING: "pending",
  LINKED: "linked",
  EXPIRED: "expired",
  UNKNOWN: "unknown",
} as const;
export type ConnectionStatusType =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

export const BudgetPeriod = {
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
  UNKNOWN: "UNKNOWN",
} as const;
export type BudgetPeriod = (typeof BudgetPeriod)[keyof typeof BudgetPeriod];
