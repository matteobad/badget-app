import type {
  DeleteAccountsRequest,
  GetAccountBalanceRequest,
  GetAccountsRequest,
  GetInstitutionsRequest,
  GetTransactionsRequest,
  ProviderParams,
} from "./types";
import { withRetry } from "~/lib/utils";
import { GoCardLessProvider } from "./gocardless/gocardless-provider";

export class Provider {
  #name?: string;

  #provider: GoCardLessProvider | null = null;

  constructor(params?: ProviderParams) {
    this.#name = params?.provider;

    switch (params?.provider) {
      case "GOCARDLESS":
        this.#provider = new GoCardLessProvider(params);
        break;
      default:
    }
  }

  async getTransactions(params: GetTransactionsRequest) {
    console.log(
      "getTransactions:",
      `provider: ${this.#name} id: ${params.accountId}`,
    );

    const data = await withRetry(() => this.#provider?.getTransactions(params));
    return data ?? [];
  }

  async getAccounts(params: GetAccountsRequest) {
    console.log("getAccounts:", `provider: ${this.#name}`);

    const data = await withRetry(() => this.#provider?.getAccounts(params));
    return data ?? [];
  }

  async getAccountBalance(params: GetAccountBalanceRequest) {
    console.log(
      "getAccountBalance:",
      `provider: ${this.#name} id: ${params.accountId}`,
    );

    return await withRetry(() => this.#provider?.getAccountBalance(params));
  }

  async getInstitutions(params: GetInstitutionsRequest) {
    console.log("getInstitutions:", `provider: ${this.#name}`);

    const data = await withRetry(() => this.#provider?.getInstitutions(params));
    return data ?? [];
  }

  async deleteAccounts(params: DeleteAccountsRequest) {
    console.log("delete:", `provider: ${this.#name}`);

    return withRetry(() => this.#provider?.deleteAccounts(params));
  }
}
