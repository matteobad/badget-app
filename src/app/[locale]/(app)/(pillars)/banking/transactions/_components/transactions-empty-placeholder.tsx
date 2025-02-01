import { Landmark } from "lucide-react";

import { AddTransaction } from "./add-transaction";

export function TransactionsEmptyPlaceholder() {
  return (
    <div className="flex h-full shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <Landmark />

        <h3 className="mt-4 text-lg font-semibold">Nessuna transazione</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Non ci sono ancora transazioni in nessuno dei tuoi conti.
        </p>
        <AddTransaction label="Aggiungi transazione" />
      </div>
    </div>
  );
}
