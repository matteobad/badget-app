import type z from "zod";
import type {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from "~/shared/validators/tag.schema";

import type { DBClient } from "../db";
import {
  createTagMutation,
  deleteTagMutation,
  updateTagMutation,
} from "../domain/tag/mutations";
import { getTagsQuery } from "../domain/tag/queries";

export async function createTag(
  db: DBClient,
  input: z.infer<typeof createTagSchema>,
  organizationId: string,
) {
  return await createTagMutation(db, { ...input, organizationId });
}

export async function updateTag(
  db: DBClient,
  input: z.infer<typeof updateTagSchema>,
  organizationId: string,
) {
  return await updateTagMutation(db, { ...input, organizationId });
}

export async function deleteTag(
  db: DBClient,
  input: z.infer<typeof deleteTagSchema>,
  organizationId: string,
) {
  return await deleteTagMutation(db, { ...input, organizationId });
}

export async function getTags(
  db: DBClient,
  _input: z.infer<typeof getTagsQuery>,
  organizationId: string,
) {
  return await getTagsQuery(db, { organizationId });
}
