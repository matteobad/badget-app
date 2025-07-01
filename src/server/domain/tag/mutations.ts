"server-only";

import type { TXType } from "~/server/db";
import type {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from "~/shared/validators/tag.schema";
import type z from "zod/v4";
import { tag_table } from "~/server/db/schema/transactions";
import { and, eq } from "drizzle-orm";

export async function createTagMutation(
  tx: TXType,
  input: z.infer<typeof createTagSchema>,
  userId: string,
) {
  return await tx
    .insert(tag_table)
    .values({ ...input, userId })
    .returning();
}

export async function updateTagMutation(
  tx: TXType,
  input: z.infer<typeof updateTagSchema>,
  userId: string,
) {
  return await tx
    .update(tag_table)
    .set(input)
    .where(and(eq(tag_table.id, input.id), eq(tag_table.userId, userId)))
    .returning();
}

export async function deleteTagMutation(
  tx: TXType,
  input: z.infer<typeof deleteTagSchema>,
  userId: string,
) {
  return await tx
    .delete(tag_table)
    .where(and(eq(tag_table.id, input.id), eq(tag_table.userId, userId)));
}
