export const BANK_PROVIDER = {
  ENABLEBANKING: "enablebanking",
  GOCARDLESS: "gocardless",
  PLAID: "plaid",
  TELLER: "teller",
} as const;
export type BankProviderType =
  (typeof BANK_PROVIDER)[keyof typeof BANK_PROVIDER];

export const ACCOUNT_TYPE = {
  // Liquidità
  CHECKING: "checking",
  SAVINGS: "savings",
  CASH: "cash",
  EWALLET: "ewallet",

  // Debiti
  CREDIT_CARD: "credit_card",
  LOAN: "loan",
  MORTGAGE: "mortgage",
  OTHER_DEBT: "other_debt",

  // Investimenti
  ETF: "etf",
  STOCK: "stock",
  BOND: "bond",
  BROKERAGE: "brokerage",
  PENSION: "pension",
  CRYPTO: "crypto",

  // Beni patrimoniali
  REAL_ESTATE: "real_estate",
  VEHICLE: "vehicle",
  OTHER_ASSET: "other_asset",

  // Altro
  OTHER: "other",
} as const;
export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

export const TRANSACTION_STATUS = {
  POSTED: "posted",
  PENDING: "pending",
  EXCLUDED: "excluded",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;
export type TransactionStatusType =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

export const TRANSACTION_METHOD = {
  PAYMENT: "payment",
  CARD_PURCHASE: "card_purchase",
  CARD_ATM: "card_atm",
  TRANSFER: "transfer",
  OTHER: "other",
  UNKNOWN: "unknown",
  ACH: "ach",
  INTEREST: "interest",
  DEPOSIT: "deposit",
  WIRE: "wire",
  FEE: "fee",
} as const;
export type TransactionMethodType =
  (typeof TRANSACTION_METHOD)[keyof typeof TRANSACTION_METHOD];

export const TRANSACTION_FREQUENCY = {
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  MONTHLY: "monthly",
  SEMI_MONTHLY: "semi_monthly",
  ANNUALLY: "annually",
  IRREGULAR: "irregular",
  UNKNOWN: "unknown",
} as const;
export type TransactionFrequencyType =
  (typeof TRANSACTION_FREQUENCY)[keyof typeof TRANSACTION_FREQUENCY];

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
