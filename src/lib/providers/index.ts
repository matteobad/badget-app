import { type DB_AccountType } from "~/server/db/schema/accounts";
import { type DB_InstitutionInsertType } from "~/server/db/schema/open-banking";
import { type DB_TransactionInsertType } from "~/server/db/schema/transactions";
import { GoCardlessProvider } from "./gocardless";

export type Providers = "gocardless" | "teller" | "plaid";

export interface BankAccountProvider {
  // health check
  getHealthCheck: () => Promise<boolean>;

  // account informations
  getAccounts(params: GetAccountsRequest): Promise<GetAccountsResponse>;
  // deleteAccounts: (params: DeleteAccountsRequest) => void;
  // getAccountBalance: (
  //   params: GetAccountBalanceRequest,
  // ) => Promise<GetAccountBalanceResponse>;
  getTransactions(
    params: GetTransactionsRequest,
  ): Promise<GetTransactionsResponse>;

  getInstitutions: (
    params: GetInstitutionsRequest,
  ) => Promise<DB_InstitutionInsertType[]>;
  // getConnectionStatus: (
  //   params: GetConnectionStatusRequest,
  // ) => Promise<GetConnectionStatusResponse>;
  // deleteConnection: (params: DeleteConnectionRequest) => void;
}

// type GetTransactionsRequest = {
//   accountId: string;
//   latest?: boolean;
//   accessToken?: string; // Teller & Plaid
//   // accountType: AccountType;
// };

type Institution = Omit<
  DB_InstitutionInsertType,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

type Account = Omit<
  DB_AccountType,
  | "id"
  | "userId"
  | "institutionId"
  | "connectionId"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

type Transaction = Omit<
  DB_TransactionInsertType,
  | "id"
  | "userId"
  | "accountId"
  | "categoryId"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type GetAccountsRequest = {
  id?: string; // GoCardLess
  accessToken?: string; // Teller & Plaid
  institutionId?: string; // Plaid
};

export type GetAccountsResponse = Account[];

export type GetTransactionsRequest = {
  accountId: string;
  latest?: boolean;
  accessToken?: string; // Teller & Plaid
  // accountType: AccountType;
};

export type GetTransactionsResponse = Transaction[];

export type GetConnectionStatusRequest = {
  id?: string;
  accessToken?: string; // Teller & Plaid
};

export type GetInstitutionsRequest = {
  countryCode?: string;
};

export type GetInstitutionsResponse = Institution[];

const providers: Record<string, BankAccountProvider> = {
  gocardless: GoCardlessProvider,
  // Future providers can be added here
};

export const getBankAccountProvider = (
  providerName: string,
): BankAccountProvider => {
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}`);
  }
  return provider;
};
