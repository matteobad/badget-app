"server-only";

import type { getTagsSchema } from "~/shared/validators/tag.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { tag_table } from "~/server/db/schema/transactions";
import { eq } from "drizzle-orm";

export async function getTagsQuery(
  _params: z.infer<typeof getTagsSchema>,
  userId: string,
) {
  const results = await db
    .select({
      id: tag_table.id,
      text: tag_table.text,
      userId: tag_table.userId,
      createdAt: tag_table.createdAt,
    })
    .from(tag_table)
    .where(eq(tag_table.userId, userId))
    .orderBy(tag_table.text);

  return results;
}
