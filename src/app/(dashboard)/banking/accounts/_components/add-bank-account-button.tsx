"use client";

import { useQueryState } from "nuqs";

import { Button } from "~/components/ui/button";

export function AddBankAccountButton() {
  const [_, setStep] = useQueryState("step");

  return (
    <Button
      data-event="Add bank account"
      data-icon="🏦"
      data-channel="bank"
      onClick={() => setStep("connect")}
    >
      Add account
    </Button>
  );
}
