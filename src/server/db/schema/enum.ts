export const Provider = {
  GOCARDLESS: "GOCARDLESS",
  PLAID: "PLAID",
  TELLER: "TELLER",
} as const;
export type Provider = (typeof Provider)[keyof typeof Provider];

export const ACCOUNT_TYPE = {
  CHECKING: "checking",
  SAVINGS: "savings",
  INVESTMENTS: "investment",
  DEBT: "debt",
  CASH: "cash",
  OTHER: "other",
} as const;
export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

export const SAVING_TYPE = {
  PENSION: "pension",
  EMERGENCY: "emergency",
} as const;
export type SavingType = (typeof SAVING_TYPE)[keyof typeof SAVING_TYPE];

// TODO: reduce possible status
export const CONNECTION_STATUS = {
  PENDING: "pending",
  LINKED: "linked",
  EXPIRED: "expired",
  UNKNOWN: "unknown",
} as const;
export type ConnectionStatusType =
  (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

export const CATEGORY_TYPE = {
  INCOME: "income",
  EXPENSE: "expense",
  SAVINGS: "savings",
  INVESTMENTS: "investments",
  TRANSFER: "transfer",
} as const;
export type CategoryType = (typeof CATEGORY_TYPE)[keyof typeof CATEGORY_TYPE];

export const BUDGET_PERIOD = {
  WEEKLY: "week",
  MONTHLY: "month",
  YEARLY: "year",
  CUSTOM: "custom",
} as const;
export type BudgetPeriod = (typeof BUDGET_PERIOD)[keyof typeof BUDGET_PERIOD];
