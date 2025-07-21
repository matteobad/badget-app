import { connectParamsSchema } from "~/shared/validators/bank-connection.schema";
import { useQueryStates } from "nuqs";

export function useConnectParams(initialCountryCode?: string) {
  const [params, setParams] = useQueryStates(
    connectParamsSchema(initialCountryCode),
  );

  return {
    ...params,
    setParams,
  };
}
