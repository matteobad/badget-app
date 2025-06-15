import "server-only";

import { unstable_cache } from "next/cache";

import {
  getAccounts_QUERY,
  getAccountsForUser,
  getConnectionsforUser,
} from "./queries";

export const getConnectionsForUser_CACHED = (userId: string) => {
  const cacheKeys = ["connection", `connection_${userId}`];
  return unstable_cache(
    async () => {
      return await getConnectionsforUser(userId);
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};

export const getAccountsForUser_CACHED = (userId: string) => {
  const cacheKeys = ["account", `account_${userId}`];
  return unstable_cache(
    async () => {
      const result = await getAccountsForUser(userId);

      // NOTE: do whatever you want here, map, aggregate filter...
      // result will be cached and typesafety preserved
      return result.reduce(
        (acc, account) => {
          const type = account.type;
          acc[type] ??= [];
          acc[type].push(account);
          return acc;
        },
        {} as Record<string, typeof result>,
      );
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};

export const getAccounts_CACHED = (userId: string) => {
  const cacheKeys = ["account", `account_${userId}`];
  return unstable_cache(
    async () => {
      const result = await getAccounts_QUERY(userId);

      return result;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};
