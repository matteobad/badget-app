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

export type GC_GetInstitutionsResponse = {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: number;
  countries: string[];
  logo: string;
  identification_codes: string[];
  max_access_valid_for_days: number;
}[];
