import { Building2 } from "lucide-react";

import { euroFormat } from "~/lib/utils";
import { getFilteredBankConnections } from "~/server/db/queries/cached-queries";

export async function ManualAccountListServer({ ids }: { ids?: string }) {
  const connections = await getFilteredBankConnections({
    account_ids: ids?.split("."),
  });

  return (
    <ul className="grid w-full grid-cols-1 gap-1">
      {connections.map((connection) => {
        return connection.bankAccount.map((account) => {
          return (
            <li key={account.id} className="flex items-center">
              <div
                key={account.id}
                className="flex w-full items-center font-light"
              >
                <Building2 className="mr-2 size-3" />
                {account.name}
                <span className="flex-1 text-right">
                  {euroFormat(account.balance ?? "0")}
                </span>
              </div>
            </li>
          );
        });
      })}
    </ul>
  );
}
