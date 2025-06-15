"use client";

import { Button } from "~/components/ui/button";
import { RocketIcon } from "lucide-react";

export function BaseContributionChoice() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-10 px-4 py-10 text-center text-xl">
        <div className="rounded-full border p-4">
          <RocketIcon className="h-10 w-10" />
        </div>
        <span className="px-6">
          Da oggi tracceremo le performance del tuo fondo!
          <br />
          <br />
          Hai contribuzioni automatiche come TFR o datore di lavoro sul fondo?
        </span>
      </div>
      <div className="flex w-full gap-4 pt-6">
        <Button variant="outline" className="flex-1">
          No, nulla
        </Button>
        <Button variant="default" className="flex-1">
          Sì
        </Button>
      </div>
    </div>
  );
}
