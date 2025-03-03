import { auth } from "@clerk/nextjs/server";
import { CreditCard, Package } from "lucide-react";
import { type SearchParams } from "nuqs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getBankingKPI_CACHED } from "~/features/dashboard/server/cached-queries";
import { getTransactions_CACHED } from "~/features/transaction/server/cached-queries";
import { transactionsSearchParamsCache } from "~/features/transaction/utils/search-params";
import PillarOverview from "../../../../features/dashboard/components/pillar-overview";
import RecentTransactionList from "../../../../features/transaction/components/recent-transaction-list";

type PageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function DashboardPage({ searchParams }: PageProps) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const search = await transactionsSearchParamsCache.parse(searchParams);

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const promises = Promise.all([getBankingKPI_CACHED(session.userId)]);

  const transactionPromise = Promise.all([
    getTransactions_CACHED({ ...search, perPage: 9 }, session.userId),
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

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Panoramica Finanziaria</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="flex h-[250px] w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
                  Grafico distribuzione asset
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
