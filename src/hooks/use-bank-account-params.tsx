import { useQueryStates } from "nuqs";
import { bankAccountParamsSchema } from "~/shared/validators/bank-account.schema";

export function useBankAccountParams() {
  const [params, setParams] = useQueryStates(bankAccountParamsSchema);

  return {
    params,
    setParams,
  };
}
