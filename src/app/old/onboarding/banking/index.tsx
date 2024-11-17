import { getPendingBankConnections } from "~/lib/data";
import {
  getFilteredInstitutions,
  getUncategorizedTransactions,
  getUserBankConnections,
  getUserCategories,
} from "~/server/db/queries/cached-queries";
import { Onboarding } from "../_components/multi-step-form";
import { BankingProvider } from "./_hooks/use-banking";
import { searchParamsCache } from "./_utils/search-params";
import AccountsStep from "./accounts-step";
import BankingIntro from "./banking-intro";
import CategoriesStep from "./categories-step";
import Done from "./done-step";
import Rules from "./rules-step";

export async function BankingOnboarding() {
  const step = searchParamsCache.get("step");
  const q = searchParamsCache.get("q");
  const country = searchParamsCache.get("country");
  const provider = searchParamsCache.get("provider");
  const ref = searchParamsCache.get("ref");

  const institutionsPromise = getFilteredInstitutions({ country, q });
  const connectionsPromise = getUserBankConnections();
  const pendingConnectionPromise = getPendingBankConnections({ provider, ref });
  const transactionsPromise = getUncategorizedTransactions({});
  const categoriesPromise = getUserCategories({});

  return (
    <BankingProvider
      institutionsPromise={institutionsPromise}
      connectionsPromise={connectionsPromise}
      pendingConnectionsPromise={pendingConnectionPromise}
      transactionsPromise={transactionsPromise}
      categoriesPromise={categoriesPromise}
    >
      <Onboarding>
        {step === "banking" && <BankingIntro />}
        {step === "banking-accounts" && <AccountsStep />}
        {step === "banking-categories" && <CategoriesStep />}
        {step === "banking-rules" && <Rules />}
        {step === "banking-done" && <Done />}
      </Onboarding>
    </BankingProvider>
  );
}
