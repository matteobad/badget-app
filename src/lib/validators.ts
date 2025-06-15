import type { ExtendedSortingState, Filter } from "~/utils/data-table";
import { SAVING_TYPE } from "~/server/db/schema/enum";
import { tag_table } from "~/server/db/schema/transactions";
import { dataTableConfig } from "~/utils/data-table";
import { createInsertSchema } from "drizzle-zod";
import { createParser } from "nuqs/server";
import { z } from "zod/v4";

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

/**
 * Create a parser for data table filters.
 * @param originalRow The original row data to create the parser for.
 * @returns A parser for data table filters state.
 */
export const getFiltersStateParser = <T>(originalRow?: Row<T>["original"]) => {
  const validKeys = originalRow ? new Set(Object.keys(originalRow)) : null;

  return createParser<Filter<T>[]>({
    parse: (value) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsed = JSON.parse(value);
        const result = z.array(filterSchema).safeParse(parsed);

        if (!result.success) return null;

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null;
        }

        return result.data as Filter<T>[];
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (filter, index) =>
          filter.id === b[index]?.id &&
          filter.value === b[index]?.value &&
          filter.type === b[index]?.type &&
          filter.operator === b[index]?.operator,
      ),
  });
};

// savings
export const addSavingsAccountFormSchema = z.object({
  type: z.enum(Object.values(SAVING_TYPE)),
});

export const CreatePensionAccountSchema = z.object({
  pensionFundId: z.number(),
  investmentBranchId: z.number(),
  joinedAt: z.date().default(new Date()),
  baseContribution: z.number().default(0),
});

export const TagInsertSchema = createInsertSchema(tag_table, {
  id: z.string(),
  text: z.string(),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const ImportDataSchema = z.object({
  id: z.string(),
  provider: z.string(),
  connectionId: z.string(),
  institutionId: z.string(),
});

export const ToggleAccountSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
});
export type ToggleAccountType = z.infer<typeof ToggleAccountSchema> & {
  userId: string;
};

// Define the feedback schema
export const FeedbackSchema = z.object({
  message: z.string().min(3, "Feedback must be at least 3 characters long"),
  category: z.enum(["bug", "feature", "other"]),
});

// Type for the feedback data
export type FeedbackType = z.infer<typeof FeedbackSchema>;
