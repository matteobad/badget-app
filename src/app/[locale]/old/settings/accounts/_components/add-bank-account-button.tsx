"use client";

import { PlusCircle } from "lucide-react";
import { useQueryState } from "nuqs";

import type { ButtonProps } from "~/components/ui/button";
import { Button } from "~/components/ui/button";

export function AddBankAccountButton({
  variant = "default",
  size = "default",
}: ButtonProps & { label?: string }) {
  const [_, setStep] = useQueryState("step");

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setStep("connect", { shallow: false })}
    >
      <PlusCircle className="mr-2 h-4 w-4" /> Connect New Account
    </Button>
  );
}
