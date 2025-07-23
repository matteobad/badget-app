import { Suspense } from "react";
import { AddAccountButton } from "~/components/bank-connection/add-account-button";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { BankAccountList } from "./bank-account-list";
import { BankAccountListSkeleton } from "./bank-account-list.loading";

export function ConnectedAccounts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>
          Manage bank accounts, update or connect new ones.
        </CardDescription>
      </CardHeader>

      <Suspense fallback={<BankAccountListSkeleton />}>
        <BankAccountList />
      </Suspense>

      <CardFooter className="flex justify-between">
        <div />

        <AddAccountButton />
      </CardFooter>
    </Card>
  );
}
