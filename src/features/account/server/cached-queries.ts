import "server-only";

import { unstable_cache } from "next/cache";

import { type DB_AccountType } from "~/server/db/schema/accounts";
import {
  type DB_ConnectionType,
  type DB_InstitutionType,
} from "~/server/db/schema/open-banking";
import { getAccountsForUser } from "./queries";

type GroupedAccounts = {
  id: string; // institutionId || accountId
  accounts: DB_AccountType[];
  connection: DB_ConnectionType | null;
  institution: DB_InstitutionType | null;
};

export const getAccountsForUser_CACHED = (userId: string) => {
  const cacheKeys = ["account", `account_${userId}`];
  return unstable_cache(
    async () => {
      const result = await getAccountsForUser(userId);

      // NOTE: do whatever you want here, map, aggregate filter...
      // result will be cached and typesafety preserved
      const groupedAccounts: GroupedAccounts[] = [];

      for (const { connection, institution, ...account } of result) {
        const id = institution?.id ?? account.id;
        const existing = groupedAccounts.find((g) => g.id === id);

        if (!existing) {
          groupedAccounts.push({
            id,
            connection,
            institution,
            ...{ accounts: account ? [account] : [] },
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          account && existing.accounts.push(account);
        }
      }

      return groupedAccounts;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};
