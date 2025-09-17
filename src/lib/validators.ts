import type { ExtendedSortingState } from "~/utils/data-table";
import { dataTableConfig } from "~/utils/data-table";
import { createParser } from "nuqs/server";
import { z } from "zod";

import type { Row } from "@tanstack/react-table";

export const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

/**
 * Creates a parser for TanStack Table sorting state.
 * @param originalRow The original row data to validate sorting keys against.
 * @returns A parser for TanStack Table sorting state.
 */
export const getSortingStateParser = <TData>(
  originalRow?: Row<TData>["original"],
) => {
  const validKeys = originalRow ? new Set(Object.keys(originalRow)) : null;

  return createParser<ExtendedSortingState<TData>>({
    parse: (value) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsed = JSON.parse(value);
        const result = z.array(sortingItemSchema).safeParse(parsed);

        if (!result.success) return null;

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null;
        }

        return result.data as ExtendedSortingState<TData>;
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc,
      ),
  });
};

export const filterSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  type: z.enum(dataTableConfig.columnTypes),
  operator: z.enum(dataTableConfig.globalOperators),
  rowId: z.string(),
});
