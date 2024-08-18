import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { PlusIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { db, schema } from "~/server/db";
import { AccountList } from "./accounts";
import { AddBankAccountButton } from "./add-bank-account-button";
import { SidebarItemSkeleton } from "./sidebar-item";

async function getAccountsByUserId() {
  const session = auth();

  if (!session?.userId) {
    throw new Error("UNAUTHORIZED");
  }

  return await db
    .select()
    .from(schema.bankAccounts)
    .where(eq(schema.bankAccounts.userId, session.userId));
}

export function SidebarAccounts() {
  const accounts = getAccountsByUserId();

  return (
    <div className="space-y-2">
      <div className="px-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between pl-4">
            <h3 className="text-sm font-semibold text-slate-500">
              Collegamenti
            </h3>
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
    </div>
  );
}
