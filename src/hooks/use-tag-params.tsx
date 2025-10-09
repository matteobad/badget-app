import { useQueryStates } from "nuqs";
import { tagParamsSchema } from "~/shared/validators/tag.schema";

export function useTagParams() {
  const [params, setParams] = useQueryStates(tagParamsSchema);

  return {
    params,
    setParams,
  };
}
