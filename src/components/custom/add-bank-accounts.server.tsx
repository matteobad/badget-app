"use server";

import { findAllInstitutions } from "~/server/db/queries/cached-queries";
import { ConnectBankAccounts } from "./connect-bank-accounts";

export async function AddBankAccountsServer({ query }: { query?: string }) {
  const institutions = await findAllInstitutions();
  const filteredInstitutions = institutions.filter((i) =>
    i.name?.toLowerCase().includes(query?.toLowerCase() ?? ""),
  );

  return (
    <div className="flex max-h-full flex-col gap-4 overflow-auto">
      {filteredInstitutions.map((institution, index) => {
        return <ConnectBankAccounts key={index} institution={institution} />;
      })}
    </div>
  );
}
