"use client";

import { PlusIcon } from "lucide-react";
import { useQueryState } from "nuqs";

import type { ButtonProps } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function AddBankAccountButton({
  variant = "default",
  size = "default",
  label,
}: ButtonProps & { label?: string }) {
  const [_, setStep] = useQueryState("step");

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setStep("connect", { shallow: false })}
      className={cn({ "rounded-full": !label })}
    >
      {!!label ? label : <PlusIcon className="h-4 w-4" />}
    </Button>
  );
}
