import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { TRANSACTION_FREQUENCY } from "~/shared/constants/enum";

export const transactionFilterParamsSchema = {
  q: parseAsString,
  categories: parseAsArrayOf(parseAsString),
  tags: parseAsArrayOf(parseAsString),
  accounts: parseAsArrayOf(parseAsString),
  type: parseAsStringLiteral(["income", "expense"] as const),
  start: parseAsString,
  end: parseAsString,
  recurring: parseAsArrayOf(
    parseAsStringLiteral([...Object.values(TRANSACTION_FREQUENCY), "all"]),
  ),
  amountRange: parseAsArrayOf(parseAsInteger),
  amount: parseAsArrayOf(parseAsString),
  manual: parseAsStringLiteral(["exclude", "include"] as const),
  reporting: parseAsStringLiteral(["exclude", "include"] as const),
};

export function useTransactionFilterParams() {
  const [filter, setFilter] = useQueryStates(transactionFilterParamsSchema);

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => value !== null),
  };
}

export const loadTransactionFilterParams = createLoader(
  transactionFilterParamsSchema,
);
