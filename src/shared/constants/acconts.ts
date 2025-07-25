import type { AccountType } from "./enum";

export const ACCOUNT_GROUP = {
  LIQUID: "liquid",
  DEBT: "debt",
  INVESTMENT: "investment",
  ASSET: "asset",
  OTHER: "other",
} as const;

export const ACCOUNT_TYPE_GROUP: Record<
  AccountType,
  keyof typeof ACCOUNT_GROUP
> = {
  checking: "LIQUID",
  savings: "LIQUID",
  cash: "LIQUID",
  ewallet: "LIQUID",

  credit_card: "DEBT",
  loan: "DEBT",
  mortgage: "DEBT",
  other_debt: "DEBT",

  brokerage: "INVESTMENT",
  etf: "INVESTMENT",
  stock: "INVESTMENT",
  bond: "INVESTMENT",
  crypto: "INVESTMENT",
  pension: "INVESTMENT",

  real_estate: "ASSET",
  vehicle: "ASSET",
  //   valuable: "ASSET",
  //   business: "ASSET",
  other_asset: "ASSET",

  other: "OTHER",
};
