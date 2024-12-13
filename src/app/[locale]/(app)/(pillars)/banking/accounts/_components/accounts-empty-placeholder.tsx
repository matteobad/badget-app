"use client";

import { Landmark } from "lucide-react";
import { useQueryStates } from "nuqs";

import { Button } from "~/components/ui/button";
import { accountsParsers } from "../account-search-params";

export function AccountsEmptyPlaceholder() {
  const [, setState] = useQueryStates(accountsParsers);

  return (
    <div className="flex h-full shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <Landmark />

        <h3 className="mt-4 text-lg font-semibold">Nessun conto aggiunto</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Non hai ancora creato e collegato alcun conto corrente.
        </p>
        <Button
          className="relative"
          onClick={() => {
            void setState({ action: "add" }, { shallow: false });
          }}
        >
          Aggiungi conto
        </Button>
      </div>
    </div>
  );
}
