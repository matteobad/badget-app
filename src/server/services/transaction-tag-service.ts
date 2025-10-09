import type z from "zod";
import type {
  createTransactionTagSchema,
  deleteTransactionTagSchema,
} from "~/shared/validators/transaction-tag.schema";

import type { DBClient } from "../db";
import {
  createTransactionTagMutation,
  deleteTransactionTagMutation,
} from "../domain/transaction-tag/mutations";

export async function createTransactionTag(
  db: DBClient,
  input: z.infer<typeof createTransactionTagSchema>,
  organizationId: string,
) {
  return await createTransactionTagMutation(db, { ...input, organizationId });
}

export async function deleteTransactionTag(
  db: DBClient,
  input: z.infer<typeof deleteTransactionTagSchema>,
  organizationId: string,
) {
  return await deleteTransactionTagMutation(db, { ...input, organizationId });
}
