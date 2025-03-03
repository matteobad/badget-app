import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRightIcon,
  ArrowUpRight,
  CreditCard,
  Layers3Icon,
  Package,
  PiggyBank,
  Target,
  TrendingUp,
} from "lucide-react";
import { type SearchParams } from "nuqs";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { getTransactions_CACHED } from "~/features/transaction/server/cached-queries";
import { transactionsSearchParamsCache } from "~/features/transaction/utils/search-params";
import { cn } from "~/lib/utils";
import RecentTransactionList from "../../../../features/transaction/components/recent-transaction-list";
import PillarOverview from "./pillar-overview";

type PageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function DashboardPage({ searchParams }: PageProps) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const search = await transactionsSearchParamsCache.parse(searchParams);

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const promises = Promise.all([
    getTransactions_CACHED({ ...search, perPage: 6 }, session.userId),
  ]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <div className="col-span-2 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Liquidità (Liquidity) */}
            <Card className={cn("flex flex-col", "w-full shrink-0")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Liquidità</CardTitle>
                <Layers3Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold">€12,500</div>

                {true && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Progress
                      </span>
                      <span className="text-zinc-900 dark:text-zinc-100">
                        83%
                      </span>
                    </div>
                    <Progress value={83} className="h-2" />
                  </div>
                )}
              </CardContent>

              <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "flex w-full items-center justify-center gap-2",
                    "rounded-t-none",
                    "px-3 py-2.5",
                    "text-xs font-medium",
                  )}
                >
                  <Link href={"/banking"}>
                    Vedi dettagli
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Fondo emergenza (Emergency Fund) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fondo emergenza
                </CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold">€12,500</div>
                {true && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Obiettivo: €6,000
                      </span>
                      <span className="text-zinc-900 dark:text-zinc-100">
                        83%
                      </span>
                    </div>
                    <Progress value={83} className="h-2" />
                  </div>
                )}
              </CardContent>
              <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "flex w-full items-center justify-center gap-2",
                    "rounded-t-none",
                    "px-3 py-2.5",
                    "text-xs font-medium",
                  )}
                >
                  <Link href={"/banking"}>
                    Vedi dettagli
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Obiettivi a breve (Short-term Objectives) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Obiettivi a breve
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 attivi</div>
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span>Vacanza: €2,500/€5,000</span>
                    <span className="font-medium">50%</span>
                  </div>
                  <Progress value={50} className="h-2" />
                  {/* <div className="text-xs text-muted-foreground">
                    2 altri obiettivi in corso
                  </div> */}
                </div>
              </CardContent>
              <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "flex w-full items-center justify-center gap-2",
                    "rounded-t-none",
                    "px-3 py-2.5",
                    "text-xs font-medium",
                  )}
                >
                  <Link href={"/banking"}>
                    Vedi dettagli
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Investimenti (Investments) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Investimenti
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€78,594</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center text-emerald-500">
                    <ArrowUpRight className="mr-1 h-4 w-4" /> +5.2%
                  </span>{" "}
                  rendimento annuale
                </p>
              </CardContent>
              <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "flex w-full items-center justify-center gap-2",
                    "rounded-t-none",
                    "px-3 py-2.5",
                    "text-xs font-medium",
                  )}
                >
                  <Link href={"/banking"}>
                    Vedi dettagli
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
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
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  <span className="flex items-center text-emerald-500">
                    <ArrowUpRight className="mr-1 h-4 w-4" /> +3.2%
                  </span>{" "}
                  rispetto al trimestre precedente
                </p>
              </CardFooter>
            </Card>

            <RecentTransactionList promises={promises} />

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Panoramica Finanziaria</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="flex h-[190px] w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
                  Grafico distribuzione asset
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-2">
            <PillarOverview />
          </div>
        </div>
      </div>
    </>
  );
}
