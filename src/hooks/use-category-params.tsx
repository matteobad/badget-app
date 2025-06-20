import { categoryParamsSchema } from "~/shared/validators/category.schema";
import { useQueryStates } from "nuqs";

export function useCategoryParams() {
  const [params, setParams] = useQueryStates(categoryParamsSchema);

  return {
    params,
    setParams,
  };
}
