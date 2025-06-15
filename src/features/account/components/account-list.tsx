"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { formatAmount } from "~/utils/format";

import { type getAccountsForUser_CACHED } from "../server/cached-queries";
import UpdateAccountDrawerSheet from "./update-account-drawer-sheet";

type AccountType = Awaited<
  ReturnType<typeof getAccountsForUser_CACHED>
>[number][number];

export default function AccountList({ accounts }: { accounts: AccountType[] }) {
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<AccountType>(accounts[0]!);

  return (
    <div className="p-2 py-0">
      {accounts.map((account) => (
        <div
          key={account.id}
          className={cn(
            "group flex items-center justify-between",
            "rounded-lg p-2",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
            "transition-all duration-200",
          )}
          onClick={() => {
            setAccount(account);
            setOpen(!open);
          }}
        >
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={account.logoUrl ?? account.institution?.logo ?? ""}
                alt={`${account.institution?.name} logo`}
              />
              <AvatarFallback className="uppercase">
                {account.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="">{account.name}</h3>
              {account.description && (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {account.description ?? account.type.toLowerCase()}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="font-medium">
              {formatAmount({
                amount: parseFloat(account.balance),
              })}
            </span>
          </div>
        </div>
      ))}

      <UpdateAccountDrawerSheet
        open={open}
        onOpenChange={setOpen}
        account={account}
      />
    </div>
  );
}
