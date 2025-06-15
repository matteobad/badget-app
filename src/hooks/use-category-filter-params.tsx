import { categoryFilterParamsSchema } from "~/shared/validators/category.schema";
import { useQueryStates } from "nuqs";

export function useCategoryFilterParams() {
  const [filter, setFilter] = useQueryStates(categoryFilterParamsSchema);

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => value !== null),
  };
}
