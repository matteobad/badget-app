"use client";

import { EuroIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { euroFormat } from "~/lib/utils";

type TotalBalanceCardProps = {
  amount: number;
  accounts: number;
};

export default function TotalBalanceCard({
  amount,
  accounts,
}: TotalBalanceCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium capitalize">
          Saldo Totale
        </CardTitle>
        <EuroIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{euroFormat(amount)}</div>
        <p className="text-xs text-muted-foreground">
          in {accounts} conti corrente
        </p>
      </CardContent>
    </Card>
  );
}
