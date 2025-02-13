import { type GetInstitutionsRequest, type GetInstitutionsResponse } from "..";
import {
  type GC_GetInstitutionsRequest,
  type GC_GetInstitutionsResponse,
} from "./gocardless-types";

export const mapInstitutionsRequest = (params: GetInstitutionsRequest) => {
  return {
    country: params.countryCode ?? "IT",
  } satisfies GC_GetInstitutionsRequest;
};

export const mapInstitutionsResponse = (
  data: GC_GetInstitutionsResponse[number],
) => {
  return {
    id: data.id,
    logo: data.logo,
    name: data.name,
    provider: "gocardless",
  } satisfies GetInstitutionsResponse[number];
};
