"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { ErrorFallback } from "~/components/error-fallback";

import type { TransactionType } from "./data";
import { TransactionsListSkeleton } from "./skeleton";
import { TransactionsList } from "./transactions-list";
import { TransactionsPeriod } from "./transactions-period";

type Props = {
  disabled: boolean;
};

export function Transactions({ disabled }: Props) {
  const [type, setType] = useState<TransactionType>("all");

  return (
    <div className="relative flex aspect-square flex-col gap-4 overflow-hidden border p-4 md:p-8">
      <TransactionsPeriod type={type} setType={setType} disabled={disabled} />

      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<TransactionsListSkeleton />}>
          <TransactionsList type={type} disabled={disabled} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
