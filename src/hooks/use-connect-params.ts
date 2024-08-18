import {
  parseAsString,
  parseAsStringEnum,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import { Provider } from "~/server/db/schema/enum";

export function useConnectParams(initialCountryCode?: string) {
  const [params, setParams] = useQueryStates({
    step: parseAsStringLiteral(["connect", "manual"]),
    countryCode: parseAsString.withDefault(initialCountryCode ?? ""),
    provider: parseAsStringEnum<Provider>(Object.values(Provider)),
    institution_id: parseAsString,
    q: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    error: parseAsString,
    ref: parseAsString,
    details: parseAsString,
  });

  return {
    ...params,
    setParams,
  };
}
