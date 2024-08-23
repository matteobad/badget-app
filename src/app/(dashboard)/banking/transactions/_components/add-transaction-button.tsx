"use client";

import { PlusIcon } from "lucide-react";
import { useQueryState } from "nuqs";

import { Button } from "~/components/ui/button";

export function AddTransactionButton() {
  const [_, setStep] = useQueryState("step");

  return (
    <Button variant="outline" size="sm" onClick={() => setStep("insert")}>
      <PlusIcon className="mr-2 size-4" />
      Crea
    </Button>
  );
}
