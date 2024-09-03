import { Suspense } from "react";

import { AddBankAccountModal } from "./_components/add-account-dialog";
import { BankConnectionTableLoading } from "./_components/bank-connection-table.loading";
import { BankConnectionTableServer } from "./_components/bank-connection-table.server";
import { ConnectStep } from "./_components/steps/connect/connect-step";
import { ManualStep } from "./_components/steps/manual/manual-step";
import { MultiStepFormWrapper } from "./_components/steps/multi-step-form-wrapper";
import { SelectStep } from "./_components/steps/select/select-step";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: { step: string; q: string };
}) {
  const { step, q } = searchParams;

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
          {step === "connect" && <ConnectStep query={q} key={step} />}
          {step === "select" && <SelectStep key={step} />}
          {step === "manual" && <ManualStep key={step} />}
          {/* {step === "tag" && <TagTransactionsStep key={step} />}
        {step === "done" && <DoneStep />} */}
        </MultiStepFormWrapper>
      </AddBankAccountModal>
    </>
  );
}
