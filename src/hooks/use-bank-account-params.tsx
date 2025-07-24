import { bankAccountParamsSchema } from "~/shared/validators/bank-account.schema";
import { useQueryStates } from "nuqs";

export function useBankAccountParams() {
  const [params, setParams] = useQueryStates(bankAccountParamsSchema);

  return {
    params,
    setParams,
  };
}
