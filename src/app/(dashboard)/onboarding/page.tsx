import {
  getFilteredAccounts,
  getUserBankConnections,
  getUserBankConnectionsByAccountIds,
} from "~/server/db/queries/cached-queries";
import Banking from "./banking/banking";
import Categories from "./banking/categories";
import { InstitutionListServer } from "./banking/institution-list.server";
import Rules from "./banking/rules";
import Transactions from "./banking/transactions";
import Features from "./features";
import Intro from "./intro";
import { Onboarding } from "./multi-step-form";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: {
    step: string;
    country: string;
    q: string;
    account_ids: string;
  };
}) {
  const { step, country, q, account_ids } = searchParams;

  // TODO: create new query to get only newly added bank accounts
  const connections = await getUserBankConnectionsByAccountIds({
    ids: account_ids?.split("."),
  });

  return (
    <>
      <Onboarding>
        {!step && <Intro key="intro" />}
        {step === "features" && <Features />}
        {step === "banking-accounts" && (
          <Banking connections={connections}>
            <InstitutionListServer country={country} q={q} />
          </Banking>
        )}
        {step === "banking-transactions" && <Transactions />}
        {step === "banking-categories" && <Categories />}
        {step === "banking-rules" && <Rules />}
        {/* {step === "create-api-key" && <CreateApiKey />}
        {step === "done" && <Done workspaceId={props.workspaceId} />}  */}
      </Onboarding>
      <div className="absolute inset-0 top-12 -z-10 bg-cover bg-center" />
    </>
  );
}
