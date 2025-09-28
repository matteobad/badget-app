import { useQueryStates } from "nuqs";
import { parseAsBoolean } from "nuqs/server";

export function useWidgetParams() {
  const [params, setParams] = useQueryStates({
    isEditing: parseAsBoolean,
  });

  return {
    params,
    setParams,
  };
}
