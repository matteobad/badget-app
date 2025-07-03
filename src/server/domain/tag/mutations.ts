"server-only";

import type { DBClient } from "~/server/db";
import type { DB_TagInsertType } from "~/server/db/schema/transactions";
import type {
  deleteTagSchema,
  updateTagSchema,
} from "~/shared/validators/tag.schema";
import type z from "zod/v4";
import { tag_table } from "~/server/db/schema/transactions";
import { and, eq } from "drizzle-orm";

export async function createTagMutation(
  client: DBClient,
  input: DB_TagInsertType,
) {
  const result = await client
    .insert(tag_table)
    .values(input)
    .onConflictDoNothing()
    .returning();

  return result[0];
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
) {
  return await client
    .delete(tag_table)
    .where(and(eq(tag_table.id, input.id), eq(tag_table.userId, input.userId)));
}
