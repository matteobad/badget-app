import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsString,
} from "nuqs/server";

// Note: import from 'nuqs/server' to avoid the "use client" directive

export const categoriesParsers = {
  id: parseAsString,
  add: parseAsBoolean,
};

export const categoriesSearchParamsCache =
  createSearchParamsCache(categoriesParsers);
