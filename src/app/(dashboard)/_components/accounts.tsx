"use client";

import { type getUserBankConnections } from "~/server/db/queries/cached-queries";
import { SidebarItem } from "./sidebar-item";

export function AccountList({
  accounts,
}: {
  accounts: Awaited<ReturnType<typeof getUserBankConnections>>;
}) {
  if (accounts.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <p className="text-2xl font-bold text-white">Nessun Conto</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-1">
      {accounts.map((connection) => {
        return connection.bankAccount.map((account) => {
          return (
            <SidebarItem
              key={account.id}
              title={account.name}
              icon={connection.logoUrl}
              variant="ghost"
            />
          );
        });
      })}
    </div>
  );
}
