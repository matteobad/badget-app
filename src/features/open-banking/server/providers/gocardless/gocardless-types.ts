export type GC_AccessTokenResponse = {
  access: "string";
  access_expires: number;
  refresh: "string";
  refresh_expires: number;
};

export type GC_RefreshTokenResponse = {
  access: string;
  access_expires: number;
};

export type GC_GetInstitutionsRequest = {
  country: string;
  access_scopes_supported?: boolean;
  account_selection_supported?: boolean;
  business_accounts_supported?: boolean;
  card_accounts_supported?: boolean;
  corporate_accounts_supported?: boolean;
  payment_submission_supported?: boolean;
  payments_enabled?: boolean;
  pending_transactions_supported?: boolean;
  private_accounts_supported?: boolean;
  read_debtor_account_supported?: boolean;
  read_refund_account_supported?: boolean;
  ssn_verification_supported?: boolean;
};

// institutions
type GC_Institution = {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: number;
  countries: string[];
  logo: string;
  identification_codes: string[];
  max_access_valid_for_days: number;
};

export type GC_GetInstitutionsResponse = GC_Institution[];

export type GC_GetInstitutionByIdResponse = GC_Institution & {
  supported_payments: { "single-payment": string[] };
  supported_features: string[];
};

// agreements
export type GC_CreateAgreementRequest = {
  institution_id: string;
  max_historical_days?: number;
  access_valid_for_days?: number;
  access_scope?: ("balances" | "details" | "transactions")[];
};

export type GC_CreateAgreementResponse = {
  id: string;
  created: string;
  institution_id: string;
  max_historical_days: number;
  access_valid_for_days: number;
  access_scope: ("balances" | "details" | "transactions")[];
  accepted: string;
};

// requisitions
type GC_Requisition = {
  id: string;
  created: string;
  redirect: string;
  status:
    | "CR"
    | "ID"
    | "LN"
    | "RJ"
    | "ER"
    | "SU"
    | "EX"
    | "GC"
    | "UA"
    | "GA"
    | "SA";
  institution_id: string;
  agreement: string;
  reference: string;
  accounts: string[];
  user_language: string;
  link: string;
  ssn: string | null;
  account_selection: boolean;
  redirect_immediate: boolean;
};

export type GC_CreateRequisitionRequest = {
  redirect: string;
  institution_id: string;
  agreement?: string;
  reference?: string;
  user_language?: string;
  ssn?: string;
  account_selection?: boolean;
  redirect_immediate?: boolean;
};

export type GC_CreateRequisitionResponse = GC_Requisition;

export type GC_GetRequisitionByIdRequest = {
  id: string;
};

export type GC_GetRequisitionByIdResponse = GC_Requisition;

export type GC_DeleteRequisitionByIdRequest = {
  id: string;
};

export type GC_DeleteRequisitionByIdResponse = {
  summary: string;
  detail: string;
};

// accounts
export type GC_Transaction = {
  transactionAmount: { amount: string; currency: string };
  currencyExchange?: {
    exchangeRate: string;
    targetCurrency: string;
    sourceCurrency: string;
  }[];
  remittanceInformationStructured?: string;
  remittanceInformationStructuredArray?: string[];
  remittanceInformationUnstructured?: string;
  remittanceInformationUnstructuredArray?: string[];
  proprietaryBankTransactionCode?: string;
  entryReference?: string;
  transactionId?: string;
  internalTransactionId: string;
  bookingDate: string;
  valueDate?: string;
  additionalInformation?: string;
  creditorName?: string;
  creditorAccount?: { iban?: string };
  debtorName?: string;
  debtorAccount?: { iban?: string };
  balanceAfterTransaction?: {
    balanceAmount?: {
      amount: string;
    };
  };
};

export type GC_GetAccountRequest = {
  id: string;
};

export type GC_GetAccountMetadataResponse = {
  id: string;
  created: string;
  last_accessed: string;
  iban: string;
  bban: string;
  status: string;
  institution_id: string;
  owner_name: string;
};

export type GC_GetAccountDetailsResponse = {
  account: {
    resourceId: string;
    iban: string;
    currency: string;
    ownerName: string;
    name: string;
    product: string;
    cashAccountType: string;
    // TODO: map remaining fields https://developer.gocardless.com/bank-account-data/endpoints
  };
};

export type GC_GetAccountBalancesResponse = {
  balances: [
    {
      balanceAmount: {
        amount: string;
        currency: string;
      };
      balanceType: string;
      referenceDate: string;
    },
  ];
};

export type GC_GetTransactionsRequest = GC_GetAccountRequest & {
  date_from?: string;
  date_to?: string;
};

export type GC_GetTransactionsResponse = {
  transactions: {
    booked: GC_Transaction[];
    posted: GC_Transaction[];
  };
};
