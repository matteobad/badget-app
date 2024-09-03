"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "~/components/ui/button";

export function ChangeStepButton({
  step,
  label,
}: {
  step: string;
  label: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Button
      className="h-auto p-0"
      variant="link"
      onClick={() => {
        const params = new URLSearchParams(searchParams);
        params.delete("q");
        params.set("step", step);
        router.replace(`${pathname}?${params.toString()}`);
      }}
    >
      {label}
    </Button>
  );
}
