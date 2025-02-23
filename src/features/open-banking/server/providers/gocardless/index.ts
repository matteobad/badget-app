import type {
  BankAccountProvider,
  GetAccountsRequest,
  GetAccountsResponse,
} from "..";
import { type GetTransactionsRequest } from "..";
import { gocardlessClient } from "./gocardless-api";
import {
  mapAccountsRequest,
  mapAccountsResponse,
  mapInstitutionsRequest,
  mapInstitutionsResponse,
  mapTransactionsRequest,
  mapTransactionsResponse,
} from "./gocardless-mappers";

export const GoCardlessProvider: BankAccountProvider = {
  async getHealthCheck() {
    const response = await fetch("/api/v2/swagger.json").catch(() => false);
    return typeof response === "boolean" ? false : response.ok;
  },

  async getInstitutions(params) {
    const request = mapInstitutionsRequest(params);
    const response = await gocardlessClient.getInstitutions(request);
    return response.map(mapInstitutionsResponse);
  },

  async getAccounts(params: GetAccountsRequest) {
    const { id } = mapAccountsRequest(params);

    const response: GetAccountsResponse = [];
    const requisition = await gocardlessClient.getRequisitionById({ id });
    const institution = await gocardlessClient.getInstitutionById({
      id: requisition.institution_id,
    });

    for (const accountId of requisition.accounts) {
      const [metadataData, detailsData, balancesData] = await Promise.all([
        gocardlessClient.getAccountMetadata({ id: accountId }),
        gocardlessClient.getAccountDetails({ id: accountId }),
        gocardlessClient.getAccountBalances({ id: accountId }),
      ]);

      const mappedAccount = mapAccountsResponse(
        accountId,
        metadataData,
        detailsData,
        balancesData,
        institution,
      );

      response.push(mappedAccount);
    }
    return response;
  },

  async getTransactions(request: GetTransactionsRequest) {
    const params = mapTransactionsRequest(request);
    const response = await gocardlessClient.getAccountTransactions(params);
    return response.transactions.booked.map(mapTransactionsResponse);
  },
};
