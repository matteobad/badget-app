import { tagParamsSchema } from "~/shared/validators/tag.schema";
import { useQueryStates } from "nuqs";

export function useTagParams() {
  const [params, setParams] = useQueryStates(tagParamsSchema);

  return {
    params,
    setParams,
  };
}
