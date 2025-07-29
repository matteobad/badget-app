"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { AddAccountButton } from "../bank-connection/add-account-button";

export function EmptyState() {
  const trpc = useTRPC();

  const { data: accounts } = useQuery(
    trpc.bankAccount.get.queryOptions({
      enabled: true,
    }),
  );

  const isEmpty = !accounts?.length;

  if (!isEmpty) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 z-20 flex h-full w-full items-center justify-center">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-medium">Connect bank account</h2>
        <p className="mb-6 text-sm text-[#878787]">
          Connect your bank account to unlock powerful financial insights. Track
          your spending, analyze trends, and make informed decisions.
        </p>

        <AddAccountButton />
      </div>
    </div>
  );
}
