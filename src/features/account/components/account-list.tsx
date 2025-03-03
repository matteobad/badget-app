"use client";

import { useQueryStates } from "nuqs";

import { cn } from "~/lib/utils";
import { type DB_AccountType } from "~/server/db/schema/accounts";
import { formatAmount } from "~/utils/format";
import { connectionsParsers } from "../utils/search-params";
import AccountIcon from "./account-icon";

export default function AccountList({
  accounts,
}: {
  accounts: DB_AccountType[];
}) {
  const [, setParams] = useQueryStates(connectionsParsers);

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
          onClick={() => setParams({ id: account.id })}
        >
          <div className="flex items-center gap-2">
            <AccountIcon type={account.type} />
            <div>
              <h3 className="">{account.name}</h3>
              {account.description && (
                <p className="text-xs text-muted-foreground">
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
    </div>
  );
}
