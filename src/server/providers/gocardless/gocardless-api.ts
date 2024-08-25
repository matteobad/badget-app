import type { XiorInstance, XiorRequestConfig } from "xior";
import { type VercelKV } from "@vercel/kv";
import { formatISO, subMonths } from "date-fns";
import xior from "xior";

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
} from "./types";
import { ProviderError } from "~/lib/utils";
import { getAccessValidForDays, getMaxHistoricalDays, isError } from "./utils";

export class GoCardLessApi {
  #baseUrl = "https://bankaccountdata.gocardless.com";

  #api: XiorInstance | null = null;

  // Cache keys
  #accessTokenCacheKey = "gocardless_access_token";
  #refreshTokenCacheKey = "gocardless_refresh_token";
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

  async #getRefreshToken(refresh: string): Promise<string> {
    const response = await this.#post<GetRefreshTokenResponse>(
      "/api/v2/token/refresh/",
      undefined,
      {
        refresh,
      },
    );

    await this.#kv?.set(this.#accessTokenCacheKey, response.access, {
      ex: response.access_expires - this.#oneHour,
    });

    return response.refresh;
  }

  async #getAccessToken(): Promise<string> {
    const [accessToken, refreshToken] = await Promise.all([
      this.#kv?.get(this.#accessTokenCacheKey),
      this.#kv?.get(this.#refreshTokenCacheKey),
    ]);

    if (typeof accessToken === "string") {
      return accessToken;
    }

    if (typeof refreshToken === "string") {
      return this.#getRefreshToken(refreshToken);
    }

    const response = await this.#post<GetAccessTokenResponse>(
      "/api/v2/token/new/",
      undefined,
      {
        secret_id: this.#secretId,
        secret_key: this.#secretKey,
      },
    );

    await Promise.all([
      this.#kv?.set(this.#accessTokenCacheKey, response.access, {
        ex: response.access_expires - this.#oneHour,
      }),
      this.#kv?.set(this.#refreshTokenCacheKey, response.refresh, {
        ex: response.refresh_expires - this.#oneHour,
      }),
    ]);

    return response.access;
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
      undefined,
      {
        params: {
          country: countryCode,
        },
      },
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

  async #getApi(accessToken?: string): Promise<XiorInstance> {
    if (!this.#api) {
      this.#api = xior.create({
        baseURL: this.#baseUrl,
        timeout: 30_000,
        headers: {
          Accept: "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });
    }

    return this.#api;
  }

  async #get<TResponse>(
    path: string,
    token?: string,
    params?: Record<string, string>,
    config?: XiorRequestConfig,
  ): Promise<TResponse> {
    const api = await this.#getApi(token);

    return api
      .get<TResponse>(path, { params, ...config })
      .then(({ data }) => data);
  }

  async #post<TResponse>(
    path: string,
    token?: string,
    body?: unknown,
    config?: XiorRequestConfig,
  ): Promise<TResponse> {
    const api = await this.#getApi(token);
    return api.post<TResponse>(path, body, config).then(({ data }) => data);
  }

  async #_delete<TResponse>(
    path: string,
    token: string,
    params?: Record<string, string>,
    config?: XiorRequestConfig,
  ): Promise<TResponse> {
    const api = await this.#getApi(token);

    return api
      .delete<TResponse>(path, { params, ...config })
      .then(({ data }) => data);
  }
}
