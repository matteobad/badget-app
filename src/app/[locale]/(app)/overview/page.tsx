import type { Metadata } from "next";
import type { SearchParams } from "nuqs";
import { ChartSelectors } from "~/components/charts/chart-selector";
import { Charts } from "~/components/charts/charts";
import { EmptyState } from "~/components/charts/empty-state";
import {
  batchPrefetch,
  getQueryClient,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";
import { metricsParamsSchema } from "~/shared/validators/metrics.schema";
import { createLoader } from "nuqs/server";

export const metadata: Metadata = {
  title: "Overview | Badget.",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Overview(props: Props) {
  const queryClient = getQueryClient();
  const searchParams = await props.searchParams;

  const loadMetricsParams = createLoader(metricsParamsSchema);
  const { from, to, currency } = loadMetricsParams(searchParams);

  batchPrefetch([
    trpc.metrics.expense.queryOptions({
      from,
      to,
      currency: currency ?? undefined,
    }),
  ]);

  // Load the data for the first visible chart
  await Promise.all([
    queryClient.fetchQuery(
      trpc.bankAccount.get.queryOptions({
        enabled: true,
      }),
    ),
    queryClient.fetchQuery(
      trpc.metrics.expense.queryOptions({
        from,
        to,
        currency: currency ?? undefined,
      }),
    ),
  ]);

  return (
    <HydrateClient>
      <div>
        <div className="mb-4 h-[530px] px-6">
          <ChartSelectors />

          <div className="relative mt-8">
            <EmptyState />
            <Charts />
          </div>
        </div>

        {/* <Widgets /> */}
      </div>
    </HydrateClient>
  );
}
