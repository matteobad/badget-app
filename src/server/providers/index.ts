import type {
  DeleteAccountsRequest,
  GetAccountBalanceRequest,
  GetAccountsRequest,
  GetHealthCheckResponse,
  GetInstitutionsRequest,
  GetTransactionsRequest,
  ProviderParams,
} from "./types";
import { logger, withRetry } from "~/lib/utils";
import { GoCardLessProvider } from "./gocardless/gocardless-provider";

export class Provider {
  #name?: string;

  #provider: GoCardLessProvider | null = null;

  constructor(params?: ProviderParams) {
    this.#name = params?.provider;

    switch (params?.provider) {
      case "gocardless":
        this.#provider = new GoCardLessProvider(params);
        break;
      default:
    }
  }

  async getHealthCheck(
    params: Omit<ProviderParams, "provider">,
  ): Promise<GetHealthCheckResponse> {
    const gocardless = new GoCardLessProvider(params);

    try {
      const [isGocardlessHealthy] = await Promise.all([
        gocardless.getHealthCheck(),
      ]);

      return {
        gocardless: {
          healthy: isGocardlessHealthy,
        },
      };
    } catch {
      throw Error("Something went wrong");
    }
  }

  async getTransactions(params: GetTransactionsRequest) {
    logger(
      "getTransactions:",
      `provider: ${this.#name} id: ${params.accountId}`,
    );

    const data = await withRetry(() => this.#provider?.getTransactions(params));

    if (data) {
      return data;
    }

    return [];
  }

  async getAccounts(params: GetAccountsRequest) {
    logger("getAccounts:", `provider: ${this.#name}`);

    const data = await withRetry(() => this.#provider?.getAccounts(params));

    if (data) {
      return data;
    }

    return [];
  }

  async getAccountBalance(params: GetAccountBalanceRequest) {
    logger(
      "getAccountBalance:",
      `provider: ${this.#name} id: ${params.accountId}`,
    );

    const data = await withRetry(() =>
      this.#provider?.getAccountBalance(params),
    );

    if (data) {
      return data;
    }

    return null;
  }

  async getInstitutions(params: GetInstitutionsRequest) {
    logger("getInstitutions:", `provider: ${this.#name}`);

    const data = await withRetry(() => this.#provider?.getInstitutions(params));

    if (data) {
      return data;
    }

    return [];
  }

  async deleteAccounts(params: DeleteAccountsRequest) {
    logger("delete:", `provider: ${this.#name}`);

    return withRetry(() => this.#provider?.deleteAccounts(params));
  }
}
