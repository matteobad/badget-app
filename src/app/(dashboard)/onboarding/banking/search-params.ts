import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

import { Provider } from "~/server/db/schema/enum";

export const searchParamsCache = createSearchParamsCache({
  // List your search param keys and associated parsers here:
  q: parseAsString.withDefault(""),
  step: parseAsString.withDefault(""),
  country: parseAsString.withDefault(""),
  provider: parseAsStringEnum<Provider>(Object.values(Provider)),
  ref: parseAsArrayOf(parseAsString, "."),
  accounts: parseAsArrayOf(parseAsString, "."),
});
