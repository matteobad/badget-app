import type {
  createTagSchema,
  deleteTagSchema,
  getTagsSchema,
} from "~/shared/validators/tag.schema";
import type z from "zod/v4";

import { db } from "../db";
import { createTagMutation, deleteTagMutation } from "../domain/tag/mutations";
import { getTagsQuery } from "../domain/tag/queries";

export async function createTag(
  input: z.infer<typeof createTagSchema>,
  userId: string,
) {
  return await createTagMutation(db, input, userId);
}

export async function deleteTag(
  input: z.infer<typeof deleteTagSchema>,
  userId: string,
) {
  return await deleteTagMutation(db, input, userId);
}

export async function getTags(
  input: z.infer<typeof getTagsSchema>,
  userId: string,
) {
  return await getTagsQuery(input, userId);
}
