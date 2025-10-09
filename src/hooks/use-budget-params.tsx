import { useQueryStates } from "nuqs";
import { budgetParamsSchema } from "~/shared/validators/budget.schema";

export function useBudgetParams() {
  const [params, setParams] = useQueryStates(budgetParamsSchema);

  return {
    params,
    setParams,
  };
}
