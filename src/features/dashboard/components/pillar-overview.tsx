import { use } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  Layers3Icon,
  PiggyBank,
  Target,
  TrendingUp,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import { formatAmount } from "~/utils/format";
import { type getBankingKPI_CACHED } from "../server/cached-queries";

interface PillarOverviewProps {
  promises: Promise<[Awaited<ReturnType<typeof getBankingKPI_CACHED>>]>;
}

export default function PillarOverview({ promises }: PillarOverviewProps) {
  const [data] = use(promises);

  return (
    <div className="col-span-2 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Liquidità (Liquidity) */}
      <Card className={cn("flex flex-col", "w-full shrink-0")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Liquidità</CardTitle>
          <Layers3Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-2xl font-bold">
            {formatAmount({ amount: data.banking })}
          </div>

          {false && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Progress
                </span>
                <span className="text-zinc-900 dark:text-zinc-100">83%</span>
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
          <CardTitle className="text-sm font-medium">Fondo emergenza</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-2xl font-bold">
            {formatAmount({ amount: data.emergency })}
          </div>
          {false && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Obiettivo: €6,000
                </span>
                <span className="text-zinc-900 dark:text-zinc-100">83%</span>
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
          <div className="text-2xl font-bold">{data.goal} attivi</div>
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
          <CardTitle className="text-sm font-medium">Investimenti</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatAmount({ amount: data.investment })}
          </div>
          {/* <p className="mt-1 text-xs text-muted-foreground">
            <span className="flex items-center text-emerald-500">
              <ArrowUpRight className="mr-1 h-4 w-4" /> +5.2%
            </span>{" "}
            rendimento annuale
          </p> */}
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
  );
}
