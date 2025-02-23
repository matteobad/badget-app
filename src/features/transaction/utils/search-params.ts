import { createSearchParamsCache, parseAsString } from "nuqs/server";

// Note: import from 'nuqs/server' to avoid the "use client" directive

export const transactionsParsers = {
  id: parseAsString,
};

export const transactionsSearchParamsCache =
  createSearchParamsCache(transactionsParsers);
