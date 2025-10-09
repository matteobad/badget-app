import { useQueryStates } from "nuqs";
import { budgetFilterParamsSchema } from "~/shared/validators/budget.schema";

export function useBudgetFilterParams() {
  const [filter, setFilter] = useQueryStates(budgetFilterParamsSchema);

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => value !== null),
  };
}
