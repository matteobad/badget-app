import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CashflowChart } from "~/features/dashboard/components/charts/cashflow-chart";
import { getBankingKPI_CACHED } from "~/features/dashboard/server/cached-queries";
import { getRecentTransactions_CACHED } from "~/features/transaction/server/cached-queries";
import { auth } from "~/server/auth/auth";
import { CreditCard, Package } from "lucide-react";

import PillarOverview from "../../../../features/dashboard/components/pillar-overview";
import RecentTransactionList from "../../../../features/transaction/components/recent-transaction-list";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const promises = Promise.all([getBankingKPI_CACHED(session.user.id)]);

  const transactionPromise = Promise.all([
    getRecentTransactions_CACHED(session.user.id),
  ]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <PillarOverview promises={promises} />
          <div className="col-span-2 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Patrimonio Netto</CardTitle>
                <CardDescription>Beni patrimoniali - Passività</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-3xl font-bold">€245,320</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      Beni patrimoniali
                    </span>
                    <span>€312,450</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Passività
                    </span>
                    <span>€67,130</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <RecentTransactionList promises={transactionPromise} />

            <CashflowChart />
          </div>
        </div>
      </div>
    </>
  );
}
