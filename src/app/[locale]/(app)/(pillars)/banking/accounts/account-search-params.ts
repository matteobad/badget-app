import { createSearchParamsCache, parseAsStringLiteral } from "nuqs/server";

// Note: import from 'nuqs/server' to avoid the "use client" directive

// List accepted values
const userActions = ["add", "connect", "backfill"] as const;

export const accountsParsers = {
  action: parseAsStringLiteral(userActions),
};

export const accountsSearchParamsCache =
  createSearchParamsCache(accountsParsers);
