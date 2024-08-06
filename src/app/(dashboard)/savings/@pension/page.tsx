import { startOfYear } from "date-fns";

import { Button } from "~/components/ui/button";
import { getPensionAccountsByUserId } from "~/lib/data";
import { type DateRange } from "~/lib/validators";
import { PensionAccountChart } from "../_components/pension-account-chart";
import { PensionAccountTable } from "../_components/pension-account-table";
import { CardReturn } from "./_components/card-return";
import { CardTotal } from "./_components/card-total";
import { CardContributions } from "./_components/contribution-list";

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

export default async function PensionPage(_props: {
  searchParams: Record<string, string | string[]>;
}) {
  const pensionAccounts = await getPensionAccountsByUserId();

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

        {/* <div>
          <DashboardFacetedFilter />
        </div> */}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CardTotal />
        <CardReturn />
        <CardContributions />
        <PensionAccountChart />
        <PensionAccountTable />
      </div>
    </div>
  );
}

// export usefull inferred types
export type DashboardFacets = ReturnType<typeof getFacetedValues>;
