import { transactionParamsSchema } from "~/shared/validators/transaction.schema";
import { useQueryStates } from "nuqs";

export function useTransactionParams() {
  const [params, setParams] = useQueryStates(transactionParamsSchema);

  return {
    params,
    setParams,
  };
}
