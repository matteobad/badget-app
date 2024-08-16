export const Provider = {
  GOCARDLESS: "GOCARDLESS",
  PLAID: "PLAID",
  TELLER: "TELLER",
} as const;
export type Provider = (typeof Provider)[keyof typeof Provider];

export const BankAccountType = {
  CREDIT: "CREDIT",
  DEPOSITORY: "DEPOSITORY",
  OTHER_ASSET: "OTHER_ASSET",
  LOAN: "LOAN",
  OTHER_LIABILITY: "OTHER_LIABILITY",
} as const;
export type BankAccountType =
  (typeof BankAccountType)[keyof typeof BankAccountType];

export const ConnectionStatus = {
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  UNKNOWN: "UNKNOWN",
} as const;
export type ConnectionStatus =
  (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

export const CategoryType = {
  INCOME: "INCOME",
  FIXED_COSTS: "FIXED_COSTS",
  SAVING_AND_INVESTMENTS: "SAVING_AND_INVESTMENTS",
  CATEGORY_BUDGETS: "CATEGORY_BUDGETS",
  TRANSFERS: "TRANSFERS",
} as const;
export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

export const BudgetPeriod = {
  WEEK: "WEEK",
  MONTH: "MONTH",
  YEAR: "YEAR",
  UNKNOWN: "UNKNOWN",
} as const;
export type BudgetPeriod = (typeof BudgetPeriod)[keyof typeof BudgetPeriod];
