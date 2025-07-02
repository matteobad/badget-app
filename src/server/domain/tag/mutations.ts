"server-only";

import type { DBClient } from "~/server/db";
import type {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from "~/shared/validators/tag.schema";
import type z from "zod/v4";
import { tag_table } from "~/server/db/schema/transactions";
import { and, eq } from "drizzle-orm";

export async function createTagMutation(
  client: DBClient,
  input: z.infer<typeof createTagSchema>,
  userId: string,
) {
  return await client
    .insert(tag_table)
    .values({ ...input, userId })
    .returning();
}

export async function updateTagMutation(
  client: DBClient,
  input: z.infer<typeof updateTagSchema>,
  userId: string,
) {
  return await client
    .update(tag_table)
    .set(input)
    .where(and(eq(tag_table.id, input.id), eq(tag_table.userId, userId)))
    .returning();
}

export async function deleteTagMutation(
  client: DBClient,
  input: z.infer<typeof deleteTagSchema>,
  userId: string,
) {
  return await client
    .delete(tag_table)
    .where(and(eq(tag_table.id, input.id), eq(tag_table.userId, userId)));
}
