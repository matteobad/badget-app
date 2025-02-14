import { Provider } from "~/server/db/schema/enum";
import { type DB_InstitutionInsertType } from "~/server/db/schema/institutions";
import { type GetInstitutionsRequest } from "..";
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
    originalId: data.id,
    logo: data.logo,
    name: data.name,
    provider: Provider.GOCARDLESS,
    countries: data.countries,
  } satisfies DB_InstitutionInsertType;
};
