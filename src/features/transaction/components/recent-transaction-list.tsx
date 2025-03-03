"use client";

import type { dynamicIconImports } from "lucide-react/dynamic";
import { use } from "react";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { formatAmount } from "~/utils/format";
import { type getTransactions_CACHED } from "../server/cached-queries";

interface RecentTransactionListProps {
  promises: Promise<[Awaited<ReturnType<typeof getTransactions_CACHED>>]>;
}

export default function RecentTransactionList({
  promises,
}: RecentTransactionListProps) {
  const [{ data }] = use(promises);

  return (
    <Card
      className={cn(
        "col-span-2 row-span-2 mx-auto w-full max-w-xl",
        "bg-white dark:bg-zinc-900/70",
        "border border-zinc-100 dark:border-zinc-800",
        "rounded-xl",
      )}
    >
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Attività recenti
            <span className="ml-1 text-xs font-normal text-zinc-600 dark:text-zinc-400">
              (6 transazioni)
            </span>
          </h2>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Questo mese
          </span>
        </div>

        <div className="space-y-1">
          {data.map((transaction) => (
            <div
              key={transaction.id}
              className={cn(
                "group flex items-center gap-3",
                "rounded-lg p-2",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                "transition-all duration-200",
              )}
            >
              <div
                className={cn(
                  "rounded-lg p-2",
                  "bg-zinc-100 dark:bg-zinc-800",
                  "border border-zinc-200 dark:border-zinc-700",
                )}
              >
                <DynamicIcon
                  name={
                    (transaction.category?.icon ??
                      "circle-dashed") as keyof typeof dynamicIconImports
                  }
                  className="h-4 w-4 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {transaction.description}
                  </h3>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    {format(transaction.date, "yyyy/MM/dd")}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pl-3">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      parseFloat(transaction.amount) > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {formatAmount({ amount: parseFloat(transaction.amount) })}
                  </span>
                  {parseFloat(transaction.amount) > 0 ? (
                    <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 p-2 dark:border-zinc-800">
        <Button
          size="sm"
          type="button"
          className={cn("flex w-full items-center justify-center gap-2")}
        >
          <span>Vedi tutte le transazioni</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
