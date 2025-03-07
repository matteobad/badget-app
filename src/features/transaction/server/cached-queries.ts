import "server-only";

import { unstable_cache } from "next/cache";

import {
  type DB_TagType,
  type DB_TransactionType,
} from "~/server/db/schema/transactions";
import {
  getRecentTransactions_QUERY,
  getTransactionAccountCounts_QUERY,
  getTransactionCategoryCounts_QUERY,
  getTransactions_QUERY,
  getTransactionTagCounts_QUERY,
} from "./queries";

type TransactionType = DB_TransactionType & {
  tags: DB_TagType[];
};

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

export const getTransactions_CACHED = (userId: string) => {
  const cacheKeys = ["transaction", `transaction_${userId}`];

  return unstable_cache(
    async () => {
      const { data } = await getTransactions_QUERY(userId);

      // NOTE: do whatever you want here, map, aggregate filter...
      // result will be cached and typesafety preserved
      const transactions: TransactionType[] = [];

      for (const row of data) {
        const { tags, ...rest } = row;
        const existing = transactions.find((t) => t.id === row.id);

        if (!existing) {
          transactions.push({
            ...rest,
            ...{ tags: tags ? [tags] : [] },
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          tags && existing.tags.push(tags);
        }
      }

      return {
        data: transactions,
      };
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};

export const getTransactionCategoryCounts_CACHED = (userId: string) => {
  const cacheKeys = ["transaction", `transaction_category_count_${userId}`];

  return unstable_cache(
    async () => {
      const data = await getTransactionCategoryCounts_QUERY(userId);
      return data;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};

export const getTransactionTagCounts_CACHED = (userId: string) => {
  const cacheKeys = ["transaction", `transaction_tag_count_${userId}`];

  return unstable_cache(
    async () => {
      const data = await getTransactionTagCounts_QUERY(userId);
      return data;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};

export const getTransactionAccountCounts_CACHED = (userId: string) => {
  const cacheKeys = ["transaction", `transaction_account_count_${userId}`];

  return unstable_cache(
    async () => {
      const data = await getTransactionAccountCounts_QUERY(userId);
      return data;
    },
    cacheKeys,
    {
      tags: cacheKeys,
      revalidate: 3600,
    },
  )();
};
