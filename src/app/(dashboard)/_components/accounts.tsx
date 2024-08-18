"use client";

import { use } from "react";
import { ArrowUpRightFromSquareIcon } from "lucide-react";

import { type schema } from "~/server/db";
import { SidebarItem } from "./sidebar-item";

export function AccountList(props: {
  accounts: Promise<(typeof schema.bankAccounts.$inferSelect)[]>;
}) {
  const accounts = use(props.accounts);

  if (accounts.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <p className="text-2xl font-bold text-white">Nessun Conto</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-1">
      {accounts.map((account) => {
        return (
          <SidebarItem
            key={account.id}
            title={account.name}
            icon={ArrowUpRightFromSquareIcon}
            variant="ghost"
          />
        );
      })}
    </div>
  );
}
