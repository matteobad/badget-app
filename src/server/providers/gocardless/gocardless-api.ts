import type { VercelKV } from "@vercel/kv";
import { formatISO, subMonths } from "date-fns";

import type { GetInstitutionsRequest, ProviderParams } from "../types";
import type {
  AccountDetails,
  DeleteRequistionResponse,
  GetAccessTokenResponse,
  GetAccountBalanceResponse,
  GetAccountDetailsResponse,
  GetAccountResponse,
  GetAccountsRequest,
  GetAccountsResponse,
  GetInstitutionResponse,
  GetInstitutionsResponse,
  GetRefreshTokenResponse,
  GetRequisitionResponse,
  GetRequisitionsResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  PostCreateAgreementResponse,
  PostEndUserAgreementRequest,
  PostRequisitionsRequest,
  PostRequisitionsResponse,
  TokenData,
} from "./types";
import { ProviderError } from "~/lib/utils";
import { getAccessValidForDays, getMaxHistoricalDays, isError } from "./utils";

export class GoCardLessApi {
  #baseUrl = "https://bankaccountdata.gocardless.com";

  // Cache keys
  #tokenCacheKey = "gocardless_tokens";
  #institutionsCacheKey = "gocardless_institutions";
  #accountCacheKey = "gocardless_account";

  #kv: VercelKV;

  #oneHour = 3600;

  #secretKey;
  #secretId;

  constructor(params: Omit<ProviderParams, "provider">) {
    this.#kv = params.kv;
    this.#secretId = params.envs.GOCARDLESS_SECRET_ID;
    this.#secretKey = params.envs.GOCARDLESS_SECRET_KEY;
  }

  async #getAccessToken() {
    const tokenData = await this.#kv?.get<TokenData>(this.#tokenCacheKey);
    const now = Date.now();

    // If access token exists and is valid, use it
    if (tokenData?.accessToken && now < tokenData.accessExpires) {
      return tokenData.accessToken;
    }

    // If refresh token exists and is valid, use it to get a new access token
    if (tokenData?.refreshToken && now < tokenData.refreshExpires) {
      const response = await this.#refreshToken(tokenData.refreshToken);
      await this.#updateTokens(response);
      return response.access;
    }

    // If both tokens are expired or don't exist, request new ones
    const response = await this.#getNewToken();
    await this.#updateTokens(response);
    return response.access;
  }

  async #refreshToken(refreshToken: string) {
    return this.#post<GetRefreshTokenResponse>(
      "/api/v2/token/refresh/",
      undefined,
      { refresh: refreshToken },
    );
  }

  async #getNewToken() {
    return this.#post<GetAccessTokenResponse>("/api/v2/token/new/", undefined, {
      secret_id: this.#secretId,
      secret_key: this.#secretKey,
    });
  }

  async #updateTokens(
    response: GetAccessTokenResponse | GetRefreshTokenResponse,
  ) {
    const now = Date.now();
    const tokenData: TokenData = {
      accessToken: response.access,
      refreshToken: response.refresh,
      accessExpires: now + response.access_expires * 1000,
      refreshExpires: now + response.refresh_expires * 1000,
    };

    await this.#kv?.set(this.#tokenCacheKey, tokenData);
  }

  async getAccountBalance(
    accountId: string,
  ): Promise<
    GetAccountBalanceResponse["balances"][0]["balanceAmount"] | undefined
  > {
    const token = await this.#getAccessToken();
    const cacheKey = `${this.#accountCacheKey}_balance_${accountId}`;

    const balances = await this.#kv?.get<GetAccountBalanceResponse>(cacheKey);

    if (balances) {
      console.log("[GoCardless] balance reading from cache:", accountId);
      const foundAccount = balances.balances?.find(
        (account) => account.balanceType === "interimAvailable",
      );

      return foundAccount?.balanceAmount ?? balances.balances[0]?.balanceAmount;
    }

    try {
      const response = await this.#get<GetAccountBalanceResponse>(
        `/api/v2/accounts/${accountId}/balances/`,
        token,
      );

      // cache for 6 hours (gocardless limit to 4 call a day)
      // TODO: better implemenetation reading response headers
      void this.#kv?.set(cacheKey, JSON.stringify(response), {
        ex: this.#oneHour * 6,
      });

      const foundAccount = response.balances?.find(
        (account) => account.balanceType === "interimAvailable",
      );

      return foundAccount?.balanceAmount ?? response.balances[0]?.balanceAmount;
    } catch (error) {
      const parsedError = isError(error);

      if (parsedError) {
        throw new ProviderError(parsedError);
      }
    }
  }

  async getInstitutions(
    params?: GetInstitutionsRequest,
  ): Promise<GetInstitutionsResponse> {
    const countryCode = params?.countryCode;
    const cacheKey = `${this.#institutionsCacheKey}_${countryCode}`;

    const institutions = await this.#kv?.get<GetInstitutionsResponse>(cacheKey);

    if (institutions) {
      return institutions;
    }

    const token = await this.#getAccessToken();

    const response = await this.#get<GetInstitutionsResponse>(
      "/api/v2/institutions/",
      token,
      countryCode ? { country: countryCode } : undefined,
    );

    void this.#kv?.set(cacheKey, JSON.stringify(response), {
      ex: this.#oneHour,
    });

    if (countryCode) {
      return response.filter((institution) =>
        institution.countries.includes(countryCode),
      );
    }

    return response;
  }

  async buildLink({
    institutionId,
    agreement,
    redirect,
  }: PostRequisitionsRequest): Promise<PostRequisitionsResponse> {
    const token = await this.#getAccessToken();

    return this.#post<PostRequisitionsResponse>(
      "/api/v2/requisitions/",
      token,
      {
        redirect,
        institution_id: institutionId,
        agreement,
      },
    );
  }

  async createEndUserAgreement({
    institutionId,
    transactionTotalDays,
  }: PostEndUserAgreementRequest): Promise<PostCreateAgreementResponse> {
    const token = await this.#getAccessToken();
    const maxHistoricalDays = getMaxHistoricalDays({
      institutionId,
      transactionTotalDays,
    });

    return this.#post<PostCreateAgreementResponse>(
      "/api/v2/agreements/enduser/",
      token,
      {
        institution_id: institutionId,
        access_scope: ["balances", "details", "transactions"],
        access_valid_for_days: getAccessValidForDays({ institutionId }),
        max_historical_days: maxHistoricalDays,
      },
    );
  }

  async getAccountDetails(id: string): Promise<GetAccountDetailsResponse> {
    const token = await this.#getAccessToken();
    const cacheKey = `${this.#accountCacheKey}_account_${id}`;

    const accounts =
      await this.#kv?.get<
        [GetAccountResponse, GetAccountResponse & AccountDetails]
      >(cacheKey);

    if (accounts) {
      console.log("[GoCardless] details reading from cache:", id);

      return {
        ...accounts[0],
        ...accounts[1],
      };
    }

    const response = await Promise.all([
      this.#get<GetAccountResponse>(`/api/v2/accounts/${id}/`, token),
      this.#get<GetAccountDetailsResponse>(
        `/api/v2/accounts/${id}/details/`,
        token,
      ),
    ]);

    // cache for 6 hours (gocardless limit to 4 call a day)
    // TODO: better implemenetation reading response headers
    void this.#kv?.set(cacheKey, JSON.stringify(response), {
      ex: this.#oneHour * 6,
    });

    return {
      ...response[0],
      ...response[1],
    };
  }

  async getInstitution(id: string): Promise<GetInstitutionResponse> {
    const token = await this.#getAccessToken();

    return this.#get<GetInstitutionResponse>(
      `/api/v2/institutions/${id}/`,
      token,
    );
  }

  async getAccounts({
    id,
  }: GetAccountsRequest): Promise<GetAccountsResponse | undefined> {
    try {
      const response = await this.getRequestion(id);

      if (!response?.accounts) {
        return undefined;
      }

      return Promise.all(
        response.accounts.map(async (acountId: string) => {
          const [details, balance, institution] = await Promise.all([
            this.getAccountDetails(acountId),
            this.getAccountBalance(acountId),
            this.getInstitution(response.institution_id),
          ]);

          return {
            balance,
            institution,
            ...details,
          };
        }),
      );
    } catch (error) {
      const parsedError = isError(error);

      if (parsedError) {
        throw new ProviderError(parsedError);
      }
    }
  }

  async getTransactions({
    accountId,
    latest,
  }: GetTransactionsRequest): Promise<
    GetTransactionsResponse["transactions"]["booked"] | undefined
  > {
    const token = await this.#getAccessToken();
    const cacheKey = `${this.#accountCacheKey}_transactions_${accountId}`;

    const transactions = await this.#kv?.get<GetTransactionsResponse>(cacheKey);

    if (transactions) {
      console.log("[GoCardless] transactions reading from cache:", accountId);
      return transactions?.transactions?.booked;
    }

    try {
      const response = await this.#get<GetTransactionsResponse>(
        `/api/v2/accounts/${accountId}/transactions/`,
        token,
        latest
          ? {
              date_from: formatISO(subMonths(new Date(), 1), {
                representation: "date",
              }),
            }
          : undefined,
      );

      // cache for 6 hours (gocardless limit to 4 call a day)
      // TODO: better implemenetation reading response headers
      void this.#kv?.set(cacheKey, JSON.stringify(response), {
        ex: this.#oneHour * 6,
      });

      return response?.transactions?.booked;
    } catch (error) {
      const parsedError = isError(error);

      if (parsedError) {
        throw new ProviderError(parsedError);
      }
    }
  }

  async getRequisitions(): Promise<GetRequisitionsResponse> {
    const token = await this.#getAccessToken();

    return this.#get<GetRequisitionsResponse>("/api/v2/requisitions/", token);
  }

  async getRequestion(id: string): Promise<GetRequisitionResponse | undefined> {
    try {
      const token = await this.#getAccessToken();

      return this.#get<GetRequisitionResponse>(
        `/api/v2/requisitions/${id}/`,
        token,
      );
    } catch (error) {
      const parsedError = isError(error);

      if (parsedError) {
        throw new ProviderError(parsedError);
      }
    }
  }

  async deleteRequisition(id: string): Promise<DeleteRequistionResponse> {
    const token = await this.#getAccessToken();

    return this.#_delete<DeleteRequistionResponse>(
      `/api/v2/requisitions/${id}/`,
      token,
    );
  }

  async #getFetchOptions(accessToken?: string): Promise<RequestInit> {
    return {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    };
  }

  async #get<TResponse>(
    path: string,
    token?: string,
    params?: Record<string, string>,
  ): Promise<TResponse> {
    const options = await this.#getFetchOptions(token);
    const url = new URL(path, this.#baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.append(key, value),
      );
    }

    const response = await fetch(url.toString(), {
      ...options,
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
  }

  async #post<TResponse>(
    path: string,
    token?: string,
    body?: unknown,
  ): Promise<TResponse> {
    const options = await this.#getFetchOptions(token);
    const url = new URL(path, this.#baseUrl);

    const response = await fetch(url.toString(), {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
  }

  async #_delete<TResponse>(
    path: string,
    token: string,
    params?: Record<string, string>,
  ): Promise<TResponse> {
    const options = await this.#getFetchOptions(token);
    const url = new URL(path, this.#baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.append(key, value),
      );
    }

    const response = await fetch(url.toString(), {
      ...options,
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
  }
}
