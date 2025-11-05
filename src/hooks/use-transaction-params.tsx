import { useQueryStates } from "nuqs";
import { parseAsBoolean, parseAsString } from "nuqs/server";

export function useTransactionParams() {
  const [params, setParams] = useQueryStates({
    transactionId: parseAsString,
    splitTransaction: parseAsString,
    createTransaction: parseAsBoolean,
    editTransaction: parseAsString,
    importTransaction: parseAsBoolean,
    step: parseAsString,
    accountId: parseAsString,
    type: parseAsString,
    hide: parseAsBoolean.withDefault(false),
  });

  return {
    params,
    setParams,
  };
}
