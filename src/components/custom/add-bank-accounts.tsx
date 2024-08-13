"use server";

import { Suspense } from "react";

import { AddBankAccountsLoading } from "./add-bank-accounts.loading";
import { AddBankAccountsServer } from "./add-bank-accounts.server";
import { SearchInstitutions } from "./search-institutions";

export async function AddBankAccounts({ query }: { query?: string }) {
  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <SearchInstitutions query={query} />
      <Suspense fallback={<AddBankAccountsLoading />}>
        <AddBankAccountsServer query={query} />
      </Suspense>
    </div>
  );
}
