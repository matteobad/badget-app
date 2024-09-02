import { Suspense } from "react";
import { type z } from "zod";

import { type accountsSearchParamsSchema } from "~/lib/validators";
import { getFilteredInstitutions } from "~/server/db/queries/cached-queries";
import { AddBankAccountModal } from "./_components/add-account-dialog";
import { BankConnectionTableLoading } from "./_components/bank-connection-table.loading";
import { BankConnectionTableServer } from "./_components/bank-connection-table.server";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: z.infer<typeof accountsSearchParamsSchema>;
}) {
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
      <AddBankAccountModal />
    </>
  );
}
