import { useQueryStates } from "nuqs";
import { connectParamsSchema } from "~/shared/validators/bank-connection.schema";

export function useConnectParams(initialCountryCode?: string) {
  const [params, setParams] = useQueryStates(
    connectParamsSchema(initialCountryCode),
  );

  return {
    ...params,
    setParams,
  };
}
