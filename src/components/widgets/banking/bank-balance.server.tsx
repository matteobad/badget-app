"use server";

import { EuroIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { euroFormat } from "~/lib/utils";
import { getUserBankConnections } from "~/server/db/queries/cached-queries";

export default async function BankBalanceServer() {
  const data = await getUserBankConnections({});

  const totalBalance = data.reduce((acc, connection) => {
    return (acc += connection.bankAccount.reduce((tot, account) => {
      return (tot += parseFloat(account.balance ?? "0"));
    }, 0));
  }, 0);

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium capitalize">
          Saldo Totale
        </CardTitle>
        <EuroIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{euroFormat(totalBalance)}</div>
        <p className="text-xs text-muted-foreground">in {2} conti corrente</p>
      </CardContent>
    </Card>
  );
}
