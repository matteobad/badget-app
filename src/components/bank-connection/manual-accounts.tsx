"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { BankAccount } from "../bank-account/bank-account";

export function ManualAccounts() {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.bankAccount.get.queryOptions({
      manual: true,
    }),
  );

  return (
    <div className="space-y-6 divide-y px-6 pb-6">
      {data?.map((account) => <BankAccount key={account.id} data={account} />)}
    </div>
  );
}
