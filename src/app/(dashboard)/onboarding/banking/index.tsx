import { getPendingBankConnections } from "~/lib/data";
import {
  getFilteredInstitutions,
  getUncategorizedTransactions,
  getUserCategories,
} from "~/server/db/queries/cached-queries";
import { searchParamsCache } from "./_utils/search-params";
import AccountsStep from "./accounts-step";
import Categories from "./categories-step";
import Done from "./done-step";
import Rules from "./rules-step";

export async function BankingOnboarding() {
  const step = searchParamsCache.get("step");
  const q = searchParamsCache.get("q");
  const country = searchParamsCache.get("country");
  const provider = searchParamsCache.get("provider");
  const ref = searchParamsCache.get("ref");

  const institutions = await getFilteredInstitutions({ country, q });
  const connections = await getPendingBankConnections({ provider, ref });
  const categories = await getUserCategories({});
  const transactions = await getUncategorizedTransactions({});

  return (
    <>
      {step === "banking-accounts" && (
        <AccountsStep connections={connections} institutions={institutions} />
      )}
      {step === "banking-categories" && <Categories />}
      {step === "banking-rules" && (
        <Rules categories={categories} transactions={transactions} />
      )}
      {step === "banking-done" && <Done />}
    </>
  );
}
