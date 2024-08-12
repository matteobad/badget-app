"use client";

import { useRouter } from "next/navigation";
import { RocketIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

export function RecurringContributionChoice() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-10 px-4 py-10 text-center text-xl">
        <div className="rounded-full border p-4">
          <RocketIcon className="h-10 w-10" />
        </div>
        <span className="px-6">
          Solo un ultimo passo e avremo finito
          <br />
          <br />
          Effettui contribuzioni ricorrenti (es. tramite RID bancario)?
        </span>
      </div>
      <div className="flex w-full gap-4 pt-6">
        <Button variant="outline" className="flex-1">
          No, solo manuali
        </Button>
        <Button variant="default" className="flex-1">
          Sì
        </Button>
      </div>
    </div>
  );
}
