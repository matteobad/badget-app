import { Suspense } from "react";

import { type Provider } from "~/server/db/schema/enum";
import { AddBankAccountModal } from "./_components/add-account-dialog";
import { AddBankAccountButton } from "./_components/add-bank-account-button";
import { BankConnectionListLoading } from "./_components/bank-connection-list.loading";
import { BankConnectionListServer } from "./_components/bank-connection-list.server";
import { AccountStep } from "./_components/steps/account/account-step";
import { ConnectStep } from "./_components/steps/connect/connect-step";
import { ManualStep } from "./_components/steps/manual/manual-step";
import { MultiStepFormWrapper } from "./_components/steps/multi-step-form-wrapper";
import { SuccessStep } from "./_components/steps/success/success-step";
import { TaggingStep } from "./_components/steps/tagging/tagging-step";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: {
    step: string;
    country: string;
    q: string;
    provider: Provider;
    ref: string;
  };
}) {
  const { step, country, q, provider, ref } = searchParams;

  return (
    <>
      <div className="flex flex-1 flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Le Tue Connessioni</h1>
          <AddBankAccountButton />
        </header>
        <Suspense fallback={<BankConnectionListLoading />}>
          <BankConnectionListServer />
        </Suspense>
      </div>

      <AddBankAccountModal isOpen={!!step}>
        <MultiStepFormWrapper>
          {step === "manual" && <ManualStep key={step} />}
          {step === "connect" && <ConnectStep country={country} query={q} />}
          {step === "account" && (
            <AccountStep provider={provider} reference={ref} />
          )}
          {step === "tagging" && (
            <TaggingStep provider={provider} reference={ref} />
          )}
          {step === "success" && (
            <SuccessStep provider={provider} reference={ref} />
          )}
        </MultiStepFormWrapper>
      </AddBankAccountModal>
    </>
  );
}
