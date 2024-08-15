"use client";

import { useQueryState } from "nuqs";

import { Button } from "~/components/ui/button";

export function AddCategoryButton() {
  const [_, setStep] = useQueryState("step");

  return <Button onClick={() => setStep("insert")}>Crea categoria</Button>;
}
