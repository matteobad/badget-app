"use server";

import { Suspense } from "react";

import { AddBankAccountsLoading } from "./add-bank-accounts.loading";
import { AddBankAccountsServer } from "./add-bank-accounts.server";
import { SelectBankAccount } from "./filter-institutions";

export async function AddBankAccounts() {
  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <SelectBankAccount />
      <Suspense fallback={<AddBankAccountsLoading />}>
        <AddBankAccountsServer />
      </Suspense>
    </div>
  );
}
