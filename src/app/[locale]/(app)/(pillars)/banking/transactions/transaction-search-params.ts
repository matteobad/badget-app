import { createSearchParamsCache, parseAsStringLiteral } from "nuqs/server";

// Note: import from 'nuqs/server' to avoid the "use client" directive

// List accepted values
const userActions = ["add", "connect", "import"] as const;

export const transactionsParsers = {
  action: parseAsStringLiteral(userActions),
};

export const transactionsSearchParamsCache =
  createSearchParamsCache(transactionsParsers);
