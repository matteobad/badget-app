export type Providers = "gocardless" | "teller" | "plaid";

export interface BankAccountProvider {
  // health check
  getHealthCheck: () => Promise<boolean>;

  // account informations
  // getAccounts(params: GetAccountsRequest): Promise<DB_AccountInsertType[]>;
  // deleteAccounts: (params: DeleteAccountsRequest) => void;
  // getAccountBalance: (
  //   params: GetAccountBalanceRequest,
  // ) => Promise<GetAccountBalanceResponse>;
  // getTransactions(
  //   params: GetTransactionsRequest,
  // ): Promise<DB_TransactionInsertType[]>;

  getInstitutions: (
    params: GetInstitutionsRequest,
  ) => Promise<GetInstitutionsResponse>;
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

export type GetAccountsRequest = {
  id?: string; // GoCardLess
  accessToken?: string; // Teller & Plaid
  institutionId?: string; // Plaid
};

export type GetAccountBalanceRequest = {
  accountId: string;
  accessToken?: string; // Teller & Plaid
};

export type GetAccountBalanceResponse = {
  currency: string;
  amount: number;
};

export type DeleteAccountsRequest = {
  accountId?: string; // GoCardLess
  accessToken?: string; // Teller & Plaid
};

export type GetConnectionStatusRequest = {
  id?: string;
  accessToken?: string; // Teller & Plaid
};

export type GetInstitutionsResponse = {
  id: string;
  name: string;
  logo: string | null;
  provider: Providers;
}[];

export type GetInstitutionsRequest = {
  countryCode?: string;
};
