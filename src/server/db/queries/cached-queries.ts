import "server-only";

import { unstable_cache } from "next/cache";

import { QUERIES } from ".";
import { type DB_AccountType } from "../schema/accounts";
import { type DB_CategoryType } from "../schema/categories";
import {
  type DB_TagType,
  type DB_TransactionType,
} from "../schema/transactions";

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

type TransactionForUser = DB_TransactionType & {
  account: DB_AccountType;
  category: DB_CategoryType | null;
  tags: DB_TagType[];
};

function getTransactionForUser(userId: string) {
  const cacheKeys = ["transaction", `transaction_${userId}`];
  return unstable_cache(
    async () => {
      const result = await QUERIES.getTransactionForUser(userId);

      // NOTE: do whatever you want here, map, aggregate filter...
      // result will be cached and typesafety preserved
      const transactions: TransactionForUser[] = [];

      for (const row of result) {
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

      return transactions;
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
  getTransactionForUser,
};
