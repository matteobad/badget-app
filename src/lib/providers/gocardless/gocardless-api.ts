import { Redis } from "@upstash/redis";

import { env } from "~/env";
import {
  type GC_AccessTokenResponse,
  type GC_GetInstitutionsRequest,
  type GC_GetInstitutionsResponse,
  type GC_RefreshTokenResponse,
} from "./gocardless-types";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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
  const headers = new Headers(options.headers);
  const token = await getValidAccessToken();
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${path}`, {
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
  const response = await fetch(`${BASE_URL}/token/new/`, {
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
  getInstitutions: async (params: GC_GetInstitutionsRequest) => {
    const cacheKey = `gocardless:institutions:${params.country}`;
    const cachedData = await redis.get<GC_GetInstitutionsResponse>(cacheKey);
    if (cachedData) return cachedData;

    const queryParams = new URLSearchParams();
    queryParams.set("country", params.country);
    const url = `/api/v2/institutions/${queryParams.toString()}`;

    const data = await fetchWithAuth<GC_GetInstitutionsResponse>(url);
    await redis.set(cacheKey, data, { ex: ONE_DAY });
    return data;
  },
};
