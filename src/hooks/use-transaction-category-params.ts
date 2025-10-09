import { useQueryStates } from "nuqs";
import { trsanctionCategoryParamsSchema } from "~/shared/validators/transaction-category.schema";

export function useTransactionCategoryParams() {
  const [params, setParams] = useQueryStates(trsanctionCategoryParamsSchema);

  return {
    params,
    setParams,
  };
}
