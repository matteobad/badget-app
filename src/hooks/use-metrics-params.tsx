import { metricsParamsSchema } from "~/shared/validators/metrics.schema";
import { useQueryStates } from "nuqs";

export function useMetricsParams() {
  const [params, setParams] = useQueryStates(metricsParamsSchema);

  return {
    params,
    setParams,
  };
}
