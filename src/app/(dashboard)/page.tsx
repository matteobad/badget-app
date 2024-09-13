import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

import { DateRangePicker } from "~/components/data-range-picker";
import { ErrorFallback } from "~/components/error-fallback";
import { ExpensesChartServer } from "./_components/expenses-chart.server";
import { dashboardSearchParamsCache } from "./_utils/dashboard-search-params";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    from?: string;
    to?: string;
  };
}) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const params = dashboardSearchParamsCache.parse(searchParams);
  const { from, to } = params;

  return (
    <div className="flex w-full flex-col gap-2">
      <DateRangePicker dateRange={{ from, to }} />
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<div>Loading...</div>}>
          <ExpensesChartServer {...params} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
