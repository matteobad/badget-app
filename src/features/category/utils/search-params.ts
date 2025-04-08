import type { inferParserType } from "nuqs/server";
import { endOfMonth, format, startOfMonth } from "date-fns";
import {
  createParser,
  createSearchParamsCache,
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import { BUDGET_PERIOD } from "~/server/db/schema/enum";

// Note: import from 'nuqs/server' to avoid the "use client" directive

const dateParser = createParser({
  parse: (value: string) => new Date(value.slice(0, 10)),
  serialize: (date: Date) => format(date, "yyyy-MM-dd"),
  eq: (a: Date, b: Date) => a.getTime() === b.getTime(),
});

export const categoriesParsers = {
  id: parseAsString,
  add: parseAsBoolean,
};

export const categoriesFiltersParsers = {
  from: dateParser.withDefault(startOfMonth(new Date())),
  to: dateParser.withDefault(endOfMonth(new Date())),
  period: parseAsStringLiteral(Object.values(BUDGET_PERIOD)).withDefault(
    BUDGET_PERIOD.MONTHLY,
  ),
};

export type CategoriesFilterType = inferParserType<
  typeof categoriesFiltersParsers
>;

export const categoriesSearchParamsCache = createSearchParamsCache({
  ...categoriesParsers,
  ...categoriesFiltersParsers,
});
