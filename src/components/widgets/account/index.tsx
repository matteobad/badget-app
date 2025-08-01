import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { ErrorFallback } from "~/components/error-fallback";

import { AccountBalanceWidget } from "./account-balance-widget";

export function AccountBalance() {
  return (
    <div className="relative aspect-square overflow-hidden border p-4 md:p-8">
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense>
          <AccountBalanceWidget />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
