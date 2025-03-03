import { createSearchParamsCache, parseAsString } from "nuqs/server";

// Note: import from 'nuqs/server' to avoid the "use client" directive

export const connectionsParsers = {
  id: parseAsString,
};

export const connectionsSearchParamsCache =
  createSearchParamsCache(connectionsParsers);

export const accountsParsers = {
  id: parseAsString,
};

export const accountsSearchParamsCache =
  createSearchParamsCache(accountsParsers);
