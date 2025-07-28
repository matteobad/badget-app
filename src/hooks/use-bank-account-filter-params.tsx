import { useQueryStates } from "nuqs";
import { parseAsString } from "nuqs/server";

export const bankAccountFilterParamsSchema = {
  q: parseAsString,
};

export function useBankAccountFilterParams() {
  const [filter, setFilter] = useQueryStates(bankAccountFilterParamsSchema, {
    // Clear URL when values are null/default
    clearOnDefault: true,
  });

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => value !== null),
  };
}
