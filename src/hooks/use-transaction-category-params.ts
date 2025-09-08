import { trsanctionCategoryParamsSchema } from "~/shared/validators/transaction-category.schema";
import { useQueryStates } from "nuqs";

export function useTransactionCategoryParams() {
  const [params, setParams] = useQueryStates(trsanctionCategoryParamsSchema);

  return {
    params,
    setParams,
  };
}
