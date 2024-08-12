import { DialogTitle } from "@radix-ui/react-dialog";
import { PlusCircleIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { AddBankAccounts } from "../_components/add-bank-accounts";
import { AddBankAccountServer } from "../_components/add-bank-accounts.server";

export default async function AccountsPage(props: {
  searchParams: Record<string, string | string[]>;
}) {
  const pensionAccounts = [];
  const step = props.searchParams.step;

  if (pensionAccounts.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-bold tracking-tight">
            Ancora nessun conto
          </h3>
          <p className="text-sm text-muted-foreground">
            Cominciamo aggiungendo il tuo primo conto corrente.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <PlusCircleIcon className="h-4 w-4" />
              Aggiungi Conto
            </Button>
          </DialogTrigger>
          <DialogContent className="flex h-[540px] flex-col gap-6 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Collega Conto</DialogTitle>
              <DialogDescription>
                Sfruttiamo diversi provider per offrirti il maggior numero di
                istituti bancari possibili. Se non trovi il tuo puoi comunque
                procedere con un tracciamento manuale.
              </DialogDescription>
            </DialogHeader>
            {!step && <AddBankAccounts />}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-end justify-between">
        <header className="flex flex-col gap-1">
          <h2 className="text-2xl tracking-tight">Conti Corrente</h2>
          <p className="text-sm font-light text-muted-foreground">
            Gestisci i conti, o aggiungine di nuovi
          </p>
        </header>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">List</div>
    </div>
  );
}
