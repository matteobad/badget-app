import "server-only";

import { unstable_cache } from "next/cache";

import { QUERIES } from ".";

function getAccountsForUser(userId: string) {
  const cacheKeys = ["accounts", `accounts_${userId}`];
  return unstable_cache(
    async () => {
      return await QUERIES.getAccountsForUser(userId);

      // NOTE: do whatever you want here, map, aggregate filter...
      // result will be cached and typesafety preserved
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
}

export const CACHED_QUERIES = {
  getAccountsForUser,
};
