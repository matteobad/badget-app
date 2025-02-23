import { createSearchParamsCache, parseAsStringLiteral } from "nuqs/server";

// Note: import from 'nuqs/server' to avoid the "use client" directive

// List accepted values
const userActions = [
  "create-account",
  "create-transaction",
  "import-transaction",
  "link-institution",
] as const;

export const actionsParsers = {
  action: parseAsStringLiteral(userActions),
};

export const actionsSearchParamsCache = createSearchParamsCache(actionsParsers);
