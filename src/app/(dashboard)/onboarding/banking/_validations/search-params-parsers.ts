import { parseAsArrayOf, parseAsString, parseAsStringEnum } from "nuqs/server";

import { Provider } from "~/server/db/schema/enum";

export const searchParamsParsers = {
  // List your search param keys and associated parsers here:
  q: parseAsString.withDefault(""),
  step: parseAsString.withDefault(""),
  country: parseAsString.withDefault(""),
  provider: parseAsStringEnum<Provider>(Object.values(Provider)),
  ref: parseAsArrayOf(parseAsString, "."), // https://github.com/47ng/nuqs/discussions/484
};
