import { Suspense } from "react";

import {
  BankAccountList,
  BankAccountListLoading,
} from "./_components/bank-account-list.server";

export default function AccountsPage() {
  return (
    <>
      <header className="">
        <h1 className="text-2xl font-semibold">
          Conti, Carte e Account collegati
        </h1>
      </header>
      <Suspense fallback={<BankAccountListLoading />}>
        <BankAccountList />
      </Suspense>
    </>
  );
}
