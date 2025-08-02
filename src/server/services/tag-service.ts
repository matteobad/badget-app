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
  organizationId: string,
) {
  return await createTagMutation(db, { ...input, organizationId });
}

export async function deleteTag(
  input: z.infer<typeof deleteTagSchema>,
  orgId: string,
) {
  return await deleteTagMutation(db, { ...input, orgId });
}

export async function getTags(
  input: z.infer<typeof getTagsSchema>,
  orgId: string,
) {
  return await getTagsQuery(input, orgId);
}
