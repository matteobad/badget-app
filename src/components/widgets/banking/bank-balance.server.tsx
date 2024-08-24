"use server";

import { EuroIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getUserBankAccounts } from "~/server/db/queries/cached-queries";
import BankBalanceCarousel from "./bank-balance-carousel";

export default async function BankBalanceServer() {
  const data = await getUserBankAccounts({});

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium capitalize">
          Saldo Totale
        </CardTitle>
        <EuroIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1">
        <BankBalanceCarousel accounts={data} />
      </CardContent>
    </Card>
  );
}
