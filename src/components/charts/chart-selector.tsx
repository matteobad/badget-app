"use client";

import { ChartFilters } from "./chart-filters";
import { ChartPeriod } from "./chart-period";
import { ChartType } from "./chart-type";

export function ChartSelectors() {
  //   const trpc = useTRPC();

  const currencies = [{ currency: "EUR" }];
  //   const { data: currencies } = useQuery(
  //     trpc.bankAccounts.currencies.queryOptions(),
  //   );

  return (
    <div className="mt-6 flex justify-between space-x-2">
      <div className="flex space-x-2">
        <ChartType />
      </div>

      <div className="flex space-x-2">
        <ChartPeriod />
        <ChartFilters
          currencies={
            currencies?.map((currency) => {
              return {
                id: currency.currency,
                name: currency.currency,
              };
            }) ?? []
          }
        />
      </div>
    </div>
  );
}
