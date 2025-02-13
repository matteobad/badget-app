import { type BankAccountProvider } from "..";
import { gocardlessClient } from "./gocardless-api";
import {
  mapInstitutionsRequest,
  mapInstitutionsResponse,
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
};
