import { type VercelKV } from "@vercel/kv";

import { type Provider } from "../db/schema/enum";
import {
  type bankAccounts,
  type bankTransactions,
} from "../db/schema/open-banking";

export type ProviderParams = {
  provider: Provider;
  kv: VercelKV;
  envs: {
    GOCARDLESS_SECRET_KEY: string;
    GOCARDLESS_SECRET_ID: string;
  };
};

export type Institution = {
  id: string;
  name: string;
  logo: string | null;
  provider: Provider;
};

export type AccountType =
  | "depository"
  | "credit"
  | "other_asset"
  | "loan"
  | "other_liability";

export type Account = {
  id: string;
  name: string;
  currency: string;
  type: AccountType;
  institution: Institution;
  balance: Balance;
};

export type Balance = {
  amount: number;
  currency: string;
};

export type GetTransactionsRequest = {
  accountId: string;
  latest?: boolean;
  accountType: AccountType;
};

export type GetAccountsRequest = {
  id?: string; // GoCardLess
};

export type GetAccountBalanceRequest = {
  accountId: string;
};

export type GetAccountBalanceResponse = {
  currency: string;
  amount: number;
};

export type DeleteAccountsRequest = {
  accountId?: string; // GoCardLess
};

export type GetTransactionsResponse = (typeof bankTransactions.$inferInsert)[];

export type GetAccountsResponse = (typeof bankAccounts.$inferInsert)[];

export type GetInstitutionsResponse = {
  id: string;
  name: string;
  logo: string | null;
  provider: Provider;
}[];

export type GetInstitutionsRequest = {
  countryCode?: string;
};
