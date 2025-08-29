"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { ErrorFallback } from "~/components/error-fallback";

import type { SpendingPeriodType } from "./data";
import { SpendingListSkeleton } from "./skeleton";
import { SpendingList } from "./spending-list";
import { SpendingPeriod } from "./spending-period";

type Props = {
  disabled: boolean;
};

export function Spending({}: Props) {
  const [period, setPeriod] = useState<SpendingPeriodType>("this_month");

  return (
    <div className="relative aspect-square overflow-hidden border">
      <div className="flex-col p-4 md:p-8">
        <SpendingPeriod period={period} onChange={setPeriod} />

        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense fallback={<SpendingListSkeleton />}>
            <SpendingList period={period} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
