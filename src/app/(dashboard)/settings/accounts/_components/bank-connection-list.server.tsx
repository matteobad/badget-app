import { getUserBankConnections } from "~/server/db/queries/cached-queries";
import { AddBankAccountButton } from "./add-bank-account-button";
import { BankConnectionList } from "./bank-connection-list";

export async function BankConnectionListServer() {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const connections = await getUserBankConnections();

  if (connections.length === 0) {
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

  return <BankConnectionList connections={connections} />;
}
