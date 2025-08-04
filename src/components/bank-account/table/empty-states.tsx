"use client";

import { AddAccountButton } from "~/components/bank-connection/add-account-button";
import { Button } from "~/components/ui/button";
import { useBankAccountFilterParams } from "~/hooks/use-bank-account-filter-params";
import { ReceiptIcon } from "lucide-react";

export function NoResults() {
  const { clearAllFilters } = useBankAccountFilterParams();

  return (
    <div className="flex h-[calc(100vh-300px)] items-center justify-center">
      <div className="flex flex-col items-center">
        <ReceiptIcon className="mb-4" />
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-lg font-medium">No results</h2>
          <p className="text-sm text-[#606060]">
            Try another search, or adjusting the filters
          </p>
        </div>

        <Button variant="outline" onClick={clearAllFilters}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}

export function NoAccounts() {
  return (
    <div className="absolute top-0 left-0 z-20 flex h-[calc(100vh-300px)] w-full items-center justify-center">
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-medium">No accounts</h2>
        <p className="mb-6 text-sm text-[#878787]">
          You haven&apos;t added any bank accounts yet. Connect your bank
          account to start tracking your finances and gain valuable insights.
        </p>

        <AddAccountButton />
      </div>
    </div>
  );
}
