import { Suspense } from "react";

import { getUserBankAccounts } from "~/server/db/queries/cached-queries";
import { AccountList } from "./accounts";
import { AddBankAccountButton } from "./add-bank-account-button";
import { SidebarItemSkeleton } from "./sidebar-item";

export async function SidebarAccounts() {
  const accounts = await getUserBankAccounts();

  return (
    <div className="space-y-2">
      <div className="space-y-1 px-3">
        <div className="flex items-center justify-between pl-4">
          <h3 className="text-sm font-semibold text-slate-500">Collegamenti</h3>
          <AddBankAccountButton size="icon" variant="ghost" />
        </div>
        <Suspense
          fallback={
            <div className="flex w-full flex-col gap-4">
              <SidebarItemSkeleton />
              <SidebarItemSkeleton />
              <SidebarItemSkeleton />
            </div>
          }
        >
          <AccountList accounts={accounts} />
        </Suspense>
      </div>
    </div>
  );
}
