export const BANK_PROVIDER = {
  ENABLEBANKING: "enablebanking",
  GOCARDLESS: "GOCARDLESS",
  PLAID: "PLAID",
  TELLER: "TELLER",
} as const;
export type BankProviderType =
  (typeof BANK_PROVIDER)[keyof typeof BANK_PROVIDER];

export const ACCOUNT_TYPE = {
  // midday
  // DEPOSITORY: "depository",
  // CREDIT: "credit",
  // OTHER_ASSET: "other_asset",
  // LOAN: "loan",
  // OTHER_LIABILITY: "other_liability",
  //custom
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

export const CONNECTION_STATUS = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
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

export const BUDGET_RECURRENCE = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  QUATERLY: "quarterly",
  YEARLY: "yearly",
  CUSTOM: "custom",
} as const;
export type BudgetRecurrenceType =
  (typeof BUDGET_RECURRENCE)[keyof typeof BUDGET_RECURRENCE];
