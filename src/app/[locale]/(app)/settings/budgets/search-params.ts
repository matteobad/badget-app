import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsString,
} from "nuqs/server";

// Note: import from 'nuqs/server' to avoid the "use client" directive

export const budgetsParsers = {
  id: parseAsString,
  add: parseAsBoolean,
};

export const budgetsSearchParamsCache = createSearchParamsCache(budgetsParsers);
