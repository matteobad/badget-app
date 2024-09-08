import {
  getBankConnections,
  getFilteredInstitutions,
  getUserBankConnections,
} from "~/server/db/queries/cached-queries";
import AccountsStep from "./accounts-step";
import Categories from "./categories";
import Done from "./done";
import Rules from "./rules";
import { searchParamsCache } from "./search-params";
import Transactions from "./transactions";

export async function BankingOnboarding() {
  const step = searchParamsCache.get("step");
  const q = searchParamsCache.get("q");
  const country = searchParamsCache.get("country");
  const provider = searchParamsCache.get("provider");
  const ref = searchParamsCache.get("ref");
  const accounts = searchParamsCache.get("accounts");

  const institutions = await getFilteredInstitutions({ country, q });
  const connections = await getBankConnections({ provider, ref, accounts });

  console.log(connections);

  return (
    <>
      {step === "banking-accounts" && (
        <AccountsStep connections={connections} institutions={institutions} />
      )}
      {step === "banking-transactions" && <Transactions />}
      {step === "banking-categories" && <Categories />}
      {step === "banking-rules" && <Rules />}
      {step === "banking-done" && <Done />}
    </>
  );
}
