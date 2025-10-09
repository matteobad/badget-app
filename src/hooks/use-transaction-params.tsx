import { useQueryStates } from "nuqs";
import { transactionParamsSchema } from "~/shared/validators/transaction.schema";

export function useTransactionParams() {
  const [params, setParams] = useQueryStates(transactionParamsSchema);

  return {
    params,
    setParams,
  };
}
