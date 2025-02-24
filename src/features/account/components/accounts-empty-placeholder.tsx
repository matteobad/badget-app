"use client";

import { Landmark } from "lucide-react";

import { AddAccountButton } from "./add-account-button";

export function AccountsEmptyPlaceholder() {
  return (
    <div className="flex h-full shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <Landmark />

        <h3 className="mt-4 text-lg font-semibold">Nessun conto aggiunto</h3>
        <p className="mt-2 mb-4 text-sm text-muted-foreground">
          Non hai ancora creato e collegato alcun conto corrente.
        </p>
        <AddAccountButton label="Aggiungi un conto" />
      </div>
    </div>
  );
}
