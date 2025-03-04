import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

import { getSortingStateParser } from "~/lib/validators";
import { type DB_TransactionType } from "~/server/db/schema/transactions";

// Note: import from 'nuqs/server' to avoid the "use client" directive

export const transactionsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(20),
  sort: getSortingStateParser<DB_TransactionType>().withDefault([
    { id: "date", desc: true },
  ]),
  date: parseAsArrayOf(parseAsString).withDefault([]),
  description: parseAsString.withDefault(""),
  amount: parseAsArrayOf(parseAsString).withDefault([]),
  category: parseAsArrayOf(parseAsString).withDefault([]),
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  account: parseAsArrayOf(parseAsString).withDefault([]),
};

export const transactionsSearchParamsCache =
  createSearchParamsCache(transactionsParsers);
