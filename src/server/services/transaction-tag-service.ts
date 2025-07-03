import type {
  createTransactionToTagSchema,
  deleteTransactionTagSchema,
} from "~/shared/validators/transaction-tag.schema";
import type z from "zod/v4";

import { db } from "../db";
import {
  createTransactionToTagMutation,
  deleteTransactionToTagMutation,
} from "../domain/transaction-tag/mutations";

export async function createTransactionTag(
  input: z.infer<typeof createTransactionToTagSchema>,
  _userId: string,
) {
  return await createTransactionToTagMutation(db, input);
}

export async function deleteTransactionTag(
  input: z.infer<typeof deleteTransactionTagSchema>,
  _userId: string,
) {
  return await deleteTransactionToTagMutation(db, input);
}
