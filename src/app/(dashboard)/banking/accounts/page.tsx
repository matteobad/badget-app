import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  BankAccountList,
  BankAccountListLoading,
} from "./_components/bank-account-list.server";

export default function AccountsPage() {
  return (
    <Card className="h-fit w-full max-w-screen-sm">
      <CardHeader>
        <CardTitle>Conti Corrente</CardTitle>
        <CardDescription>
          Manage bank accounts, update or connect new ones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Suspense fallback={<BankAccountListLoading />}>
          <BankAccountList />
        </Suspense>
      </CardContent>
    </Card>
  );
}
