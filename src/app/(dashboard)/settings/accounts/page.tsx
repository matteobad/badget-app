import { Suspense } from "react";

import { type Provider } from "~/server/db/schema/enum";
import { AddBankAccountModal } from "./_components/add-account-dialog";
import { BankConnectionTableLoading } from "./_components/bank-connection-table.loading";
import { BankConnectionTableServer } from "./_components/bank-connection-table.server";
import { AccountStep } from "./_components/steps/account/account-step";
import { ConnectStep } from "./_components/steps/connect/connect-step";
import { LoadingStep } from "./_components/steps/loading/loading-step";
import { ManualStep } from "./_components/steps/manual/manual-step";
import { MultiStepFormWrapper } from "./_components/steps/multi-step-form-wrapper";
import { SuccessStep } from "./_components/steps/success/success-step";
import { TaggingStep } from "./_components/steps/tagging/tagging-step";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: { step: string; q: string; provider: Provider; ref: string };
}) {
  const { step, q, provider, ref } = searchParams;

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
      <AddBankAccountModal>
        <MultiStepFormWrapper>
          {step === "manual" && <ManualStep key={step} />}
          {step === "connect" && <ConnectStep query={q} key={step} />}
          {step === "account" && (
            <AccountStep provider={provider} reference={ref} />
          )}
          {step === "tagging" && (
            <TaggingStep provider={provider} reference={ref} />
          )}
          {step === "loading" && (
            <LoadingStep provider={provider} reference={ref} />
          )}
          {step === "success" && (
            <SuccessStep provider={provider} reference={ref} />
          )}
        </MultiStepFormWrapper>
      </AddBankAccountModal>
    </>
  );
}
