"use server";

import { findAllInstitutions } from "~/lib/cached-queries";
import { ConnectBankAccounts } from "./connect-bank-accounts";

export async function AddBankAccountsServer() {
  const institutions = await findAllInstitutions();

  return (
    <div className="flex max-h-full flex-col gap-4 overflow-auto">
      {institutions.map((institution, index) => {
        return <ConnectBankAccounts key={index} institution={institution} />;
      })}
    </div>
  );
}
