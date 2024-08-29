import { Suspense } from "react";

import { BankConnectionTableLoading } from "./_components/bank-connection-table.loading";
import { BankConnectionTableServer } from "./_components/bank-connection-table.server";

export default function AccountsPage() {
  return (
    <>
      <header className="">
        <h1 className="text-2xl font-semibold">
          Conti, Carte e Account collegati
        </h1>
      </header>
      <Suspense fallback={<BankConnectionTableLoading />}>
        <BankConnectionTableServer />
      </Suspense>
    </>
  );
}
