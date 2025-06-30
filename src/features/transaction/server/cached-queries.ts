import "server-only";

import { unstable_cache } from "~/lib/unstable-cache";

import { getRecentTransactions_QUERY } from "./queries";

export const getRecentTransactions_CACHED = (userId: string) => {
  const cacheKeys = ["transaction", `transaction_${userId}`];

  return unstable_cache(
    async () => {
      const data = await getRecentTransactions_QUERY(userId);

      // NOTE: do whatever you want here, map, aggregate filter...
      // result will be cached and typesafety preserved
      return data;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};
