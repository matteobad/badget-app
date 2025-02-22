import AccountList from "./account-list";
import { ExpensesChart } from "./expenses-chart";
import PillarOverview from "./pillar-overview";
import RecentTransactionList from "./recent-transaction-list";

export default function Page() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
          <ExpensesChart />
        </div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-muted/50">
            <AccountList />
          </div>
          <div className="rounded-xl bg-muted/50">
            <RecentTransactionList />
          </div>
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <PillarOverview />
        </div>
      </div>
    </>
  );
}
