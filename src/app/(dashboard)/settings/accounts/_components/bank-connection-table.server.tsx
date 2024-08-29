import { AddBankAccountButton } from "~/app/(dashboard)/_components/add-bank-account-button";
import { getUserBankConnections } from "~/server/db/queries/cached-queries";
import { BankConnectionTable } from "./bank-connection-table";

export async function BankConnectionTableServer() {
  const data = await getUserBankConnections();

  if (data.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-bold tracking-tight">Nessun Conto</h3>
          <p className="text-sm text-muted-foreground">
            Cominciamo aggiungendo il tuo primo conto corrente.
          </p>
        </div>
        <AddBankAccountButton label="Aggiungi Conto" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full rounded border">
        <BankConnectionTable data={data} />
      </div>
      <div className="flex justify-end">
        <AddBankAccountButton label="Aggiungi Conto" />
      </div>
    </div>
  );
}
