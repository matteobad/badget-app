import BudgetActualCard from "~/components/widgets/banking/budget-actual-card";
import { OverviewChart } from "~/components/widgets/banking/overview-chart";
import RecentTransactionTable from "~/components/widgets/banking/recent-transactions-table";
import TotalBalanceCard from "~/components/widgets/banking/total-balance-card";
import {
  getUserBankConnections,
  getUserTransactions,
} from "~/server/db/queries/cached-queries";

export default async function PensionPage() {
  const data = await getUserBankConnections({});
  const transactions = await getUserTransactions({});

  const totalBalance = data.reduce((acc, connection) => {
    return (acc += connection.bankAccount.reduce((tot, account) => {
      return (tot += parseFloat(account.balance ?? "0"));
    }, 0));
  }, 0);

  return (
    <div className="grid grid-cols-4 gap-6">
      <TotalBalanceCard amount={totalBalance} accounts={2} />
      <BudgetActualCard
        title="Income"
        budget={2300}
        actual={2260}
        icon="trending-up"
      />
      <BudgetActualCard
        title="Outcome"
        budget={2000}
        actual={1950}
        icon="trending-down"
      />
      <BudgetActualCard
        title="Savings & Investments"
        budget={150}
        actual={150}
        icon="leaf"
      />
      <div className="col-span-2">
        <OverviewChart />
      </div>
      <div className="col-span-2">
        <RecentTransactionTable />
      </div>

      {/* <div>
        <Carousel className="flex flex-col items-end">
          <div className="flex items-center gap-4">
            <CarouselPrevious className="relative inset-0" />
            <CarouselNext className="relative inset-0" />
          </div>
          <CarouselContent className="grid grid-cols-2 gap-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <CarouselItem key={index}>
                <RecentTransactionTable />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div> */}
    </div>
  );
}
