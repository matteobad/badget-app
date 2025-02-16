import type {
  GC_AccessTokenResponse,
  GC_CreateAgreementRequest,
  GC_CreateAgreementResponse,
  GC_CreateRequisitionRequest,
  GC_CreateRequisitionResponse,
  GC_DeleteRequisitionByIdRequest,
  GC_DeleteRequisitionByIdResponse,
  GC_GetAccountBalancesResponse,
  GC_GetAccountDetailsResponse,
  GC_GetAccountMetadataResponse,
  GC_GetAccountRequest,
  GC_GetInstitutionByIdResponse,
  GC_GetInstitutionsRequest,
  GC_GetInstitutionsResponse,
  GC_GetRequisitionByIdRequest,
  GC_GetRequisitionByIdResponse,
  GC_RefreshTokenResponse,
} from "./gocardless-types";
import { env } from "~/env";
import { redis } from "~/server/redis";
import {
  type GC_GetTransactionsRequest,
  type GC_GetTransactionsResponse,
} from "./gocardless-types";

export interface ErrorResponse {
  detail: string;
  summary: string;
  status_code: number;
}

export interface AccountBalance {
  balances: Array<{
    balanceAmount: {
      amount: string;
      currency: string;
    };
  }>;
}

export interface Transaction {
  transactionId?: string;
  debtorName?: string;
  debtorAccount?: {
    iban: string;
  };
  transactionAmount: {
    currency: string;
    amount: string;
  };
  bankTransactionCode?: string;
  bookingDate?: string;
  valueDate?: string;
  remittanceInformationUnstructured?: string;
  remittanceInformationStructured?: string;
  additionalInformation?: string;
  purposeCode?: string;
}

export interface AccountTransactions {
  transactions: {
    booked: Transaction[];
    pending?: Transaction[];
  };
}

const BASE_URL = "https://bankaccountdata.gocardless.com";

const ONE_DAY = 3600 * 24;
const ACCESS_KEY = "gocardless:access_token";
const REFRESH_KEY = "gocardless:refresh_token";

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(options.headers);
  const token = await getValidAccessToken();
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  console.log(`[gocardless] fetching ${url}`);
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    throw new Error((data as ErrorResponse).detail || "Unknown error occurred");
  }

  return data;
}

async function getAccessToken() {
  const response = await fetch(`${BASE_URL}/api/v2/token/new/`, {
    method: "POST",
    body: JSON.stringify({
      secret_id: env.GOCARDLESS_SECRET_ID,
      secret_key: env.GOCARDLESS_SECRET_KEY,
    }),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to get access token");

  const data = (await response.json()) as GC_AccessTokenResponse;
  const { access, access_expires, refresh, refresh_expires } = data;

  await redis.set(ACCESS_KEY, access, { ex: access_expires });
  await redis.set(REFRESH_KEY, refresh, { ex: refresh_expires });

  return access;
}

async function getRefreshToken(refreshToken: string) {
  const response = await fetch(`${BASE_URL}/token/refresh/`, {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to refresh token");

  const data = (await response.json()) as GC_RefreshTokenResponse;
  const { access, access_expires } = data;
  await redis.set(ACCESS_KEY, access, { ex: access_expires });

  return access;
}

async function getValidAccessToken() {
  const accessToken = await redis.get<string>(ACCESS_KEY);
  if (accessToken) return accessToken;

  const refreshToken = await redis.get<string>(REFRESH_KEY);
  if (refreshToken) return getRefreshToken(refreshToken);

  return getAccessToken();
}

export const gocardlessClient = {
  // institutions
  getInstitutions: async (params: GC_GetInstitutionsRequest) => {
    const cacheKey = `gocardless:institutions:${params.country}`;
    const cachedData = await redis.get<GC_GetInstitutionsResponse>(cacheKey);
    if (cachedData) return cachedData;

    const queryParams = new URLSearchParams();
    queryParams.set("country", params.country);
    const url = `/api/v2/institutions/?${queryParams.toString()}`;

    const data = await fetchWithAuth<GC_GetInstitutionsResponse>(url);
    await redis.set(cacheKey, data, { ex: ONE_DAY });
    return data;
  },

  getInstitutionById: async (params: { id: string }) => {
    const url = `/api/v2/institutions/${params.id}`;
    return await fetchWithAuth<GC_GetInstitutionByIdResponse>(url);
  },

  // agreements
  createAgreement: async (params: GC_CreateAgreementRequest) => {
    const url = `/api/v2/agreements/enduser/`;
    return await fetchWithAuth<GC_CreateAgreementResponse>(url, {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  // requisitions
  createRequisition: async (params: GC_CreateRequisitionRequest) => {
    const url = `/api/v2/requisitions/`;
    return await fetchWithAuth<GC_CreateRequisitionResponse>(url, {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  getRequisitionById: async (params: GC_GetRequisitionByIdRequest) => {
    const url = `/api/v2/requisitions/${params.id}/`;
    return await fetchWithAuth<GC_GetRequisitionByIdResponse>(url);
  },

  deleteRequisitionById: async (params: GC_DeleteRequisitionByIdRequest) => {
    const url = `/api/v2/requisitions/${params.id}/`;
    return await fetchWithAuth<GC_DeleteRequisitionByIdResponse>(url, {
      method: "DELETE",
    });
  },

  // accounts
  getAccountMetadata: async (params: GC_GetAccountRequest) => {
    const cacheKey = `gocardless:account_metadata:${params.id}`;
    const cachedData = await redis.get<GC_GetAccountMetadataResponse>(cacheKey);
    if (cachedData) return cachedData;

    const url = `/api/v2/accounts/${params.id}/`;
    const data = await fetchWithAuth<GC_GetAccountMetadataResponse>(url);
    await redis.set(cacheKey, data, { ex: ONE_DAY });
    return data;
  },
  getAccountDetails: async (params: GC_GetAccountRequest) => {
    const cacheKey = `gocardless:account_details:${params.id}`;
    const cachedData = await redis.get<GC_GetAccountDetailsResponse>(cacheKey);
    if (cachedData) return cachedData;

    const url = `/api/v2/accounts/${params.id}/details/`;
    const data = await fetchWithAuth<GC_GetAccountDetailsResponse>(url);
    await redis.set(cacheKey, data, { ex: ONE_DAY });
    return data;
  },
  getAccountBalances: async (params: GC_GetAccountRequest) => {
    const cacheKey = `gocardless:account_balances:${params.id}`;
    const cachedData = await redis.get<GC_GetAccountBalancesResponse>(cacheKey);
    if (cachedData) return cachedData;

    const url = `/api/v2/accounts/${params.id}/balances/`;
    const data = await fetchWithAuth<GC_GetAccountBalancesResponse>(url);
    await redis.set(cacheKey, data, { ex: ONE_DAY });
    return data;
  },
  getAccountTransactions: async (params: GC_GetTransactionsRequest) => {
    const paramsKey = Object.values(params).join(":");
    const cacheKey = `gocardless:account_transactions:${paramsKey}`;
    const cachedData = await redis.get<GC_GetTransactionsResponse>(cacheKey);
    if (cachedData) return cachedData;

    const url = `/api/v2/accounts/${params.id}/transactions/`;
    const data = await fetchWithAuth<GC_GetTransactionsResponse>(url);
    await redis.set(cacheKey, data, { ex: ONE_DAY });
    return data;
  },
};
