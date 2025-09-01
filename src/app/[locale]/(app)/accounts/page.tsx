import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { AssetsAccordion } from "~/components/assets-liabilities/assets-accordion";
import { FinancialMetrics } from "~/components/assets-liabilities/financial-metrics";
import { FinancialMetricsSkeleton } from "~/components/assets-liabilities/financial-metrics-skeleton";
import { MainActions } from "~/components/assets-liabilities/main-actions";
import { AccountsSearchFilter } from "~/components/bank-account/accounts-search-filter";
import { Loading } from "~/components/bank-account/table/loading";
import { ErrorFallback } from "~/components/error-fallback";
import {
  batchPrefetch,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";
import { metricsParamsSchema } from "~/shared/validators/metrics.schema";
import { createLoader } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";

export const metadata: Metadata = {
  title: "Assets & Liabilities | Badget.",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AssetsLiabilitiesPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const loadMetricsParams = createLoader(metricsParamsSchema);
  const { from, to } = loadMetricsParams(searchParams);

  batchPrefetch([
    trpc.asset.get.queryOptions(),
    trpc.metrics.financialMetrics.queryOptions({ from, to }),
  ]);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<FinancialMetricsSkeleton />}>
          <FinancialMetrics />
        </Suspense>
      </ErrorBoundary>
      <div className="flex flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <AccountsSearchFilter />
          <MainActions />
        </div>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<Loading />}>
            <AssetsAccordion />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
}
