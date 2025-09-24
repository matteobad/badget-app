import type {
  getRecurringEntriesByDateSchema,
  getRecurringEntriesByRangeSchema,
} from "~/shared/validators/recurring-entry.schema";
import type z from "zod";

import type { DBClient } from "../db";
import {
  getRecurringEntriesByDateQuery,
  getRecurringEntriesByRangeQuery,
} from "../domain/recurring-entry/queries";

export async function getRecurringEntriesByDate(
  db: DBClient,
  input: z.infer<typeof getRecurringEntriesByDateSchema>,
  organizationId: string,
) {
  return await getRecurringEntriesByDateQuery(db, { ...input, organizationId });
}

export async function getRecurringEntriesByRange(
  db: DBClient,
  input: z.infer<typeof getRecurringEntriesByRangeSchema>,
  organizationId: string,
) {
  return await getRecurringEntriesByRangeQuery(db, {
    ...input,
    organizationId,
  });
}
