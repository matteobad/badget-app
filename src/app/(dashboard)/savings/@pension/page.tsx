import { PlusCircleIcon } from "lucide-react";

import { BaseContributionChoice } from "~/components/forms/base-contribution-choice";
import { RecurringContributionChoice } from "~/components/forms/recurring-contribution-choice";
import { TrackPensionAccountDone } from "~/components/forms/track-pension-account-done";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { getPensionAccountsByUserId } from "~/lib/data";
import { PensionAccountChart } from "../_components/pension-account-chart";
import { PensionAccountTable } from "../_components/pension-account-table";
import { CardReturn } from "./_components/card-return";
import { CardTotal } from "./_components/card-total";
import { CardContributions } from "./_components/contribution-list";
import { CreateAccountServer } from "./_components/create-account.server";

export default async function PensionPage(props: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const pensionAccounts = await getPensionAccountsByUserId();
  const step = (await props.searchParams).step;

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
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <PlusCircleIcon className="h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="min-h-[526px] sm:max-w-[425px]">
            {!step && <CreateAccountServer />}
            {step === "choice-base" && <BaseContributionChoice />}
            {step === "choice-recurring" && <RecurringContributionChoice />}
            {step === "done" && <TrackPensionAccountDone />}
            {/* <DialogFooter>
          <Button type="submit">Start tracking!</Button>
        </DialogFooter> */}
          </DialogContent>
        </Dialog>
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
