import { budgetFilterParamsSchema } from "~/shared/validators/budget.schema";
import { useQueryStates } from "nuqs";

export function useBudgetFilterParams() {
  const [filter, setFilter] = useQueryStates(budgetFilterParamsSchema);

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => value !== null),
  };
}
