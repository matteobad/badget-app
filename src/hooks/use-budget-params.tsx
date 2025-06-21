import { budgetParamsSchema } from "~/shared/validators/budget.schema";
import { useQueryStates } from "nuqs";

export function useBudgetParams() {
  const [params, setParams] = useQueryStates(budgetParamsSchema);

  return {
    params,
    setParams,
  };
}
