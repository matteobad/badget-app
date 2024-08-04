import { startOfYear } from "date-fns";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  findAllPensionFunds,
  getPensionAccountsByUserId,
  getPensionFunsContributions,
} from "~/lib/data";
import { type DateRange } from "~/lib/validators";
import { DashboardFacetedFilter } from "../_components/faceted-filter";
import { PensionAccountChart } from "../_components/pension-account-chart";
import { PensionAccountTable } from "../_components/pension-account-table";
import { ContributionList } from "./_components/contribution-list";

const getFacetedValues = (searchParams: Record<string, string | string[]>) => {
  const { from, to, funds } = searchParams;

  const defaultTimeframe = {
    from: from ? new Date(from as string) : startOfYear(new Date()),
    to: to ? new Date(to as string) : new Date(),
  } satisfies DateRange;

  const defaulFunds = (funds as string[]) ?? [];

  return {
    timeframe: defaultTimeframe,
    funds: defaulFunds,
  };
};

export default async function PensionPage(props: {
  searchParams: Record<string, string | string[]>;
}) {
  const facets = getFacetedValues(props.searchParams);
  const pensionAccounts = await getPensionAccountsByUserId();
  const pensionFundsPromise = findAllPensionFunds();
  const pensionFunsContributionsPromise = getPensionFunsContributions(
    facets.timeframe,
    facets.funds,
  );

  if (pensionAccounts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-bold tracking-tight">
            No pension accounts yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Let&apos;s start by adding your first pension account.
          </p>
        </div>
        <Button>Add Pension Fund</Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-end justify-between">
        <header className="flex flex-col gap-1">
          <h2 className="text-2xl tracking-tight">Pension funds</h2>
          <p className="text-sm font-light text-muted-foreground">
            Overview of all the pension accounts you have.
          </p>
        </header>

        <div>
          <DashboardFacetedFilter />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Principal
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from the start
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IRPEF Savings</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <PensionAccountChart />
        <ContributionList
          promise={pensionFunsContributionsPromise}
          facets={facets}
        />
        <PensionAccountTable />
      </div>
    </div>
  );
}

// export usefull inferred types
export type DashboardFacets = ReturnType<typeof getFacetedValues>;
