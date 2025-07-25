"server-only";

import type { DBClient } from "~/server/db";
import type { getTagsSchema } from "~/shared/validators/tag.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { tag_table } from "~/server/db/schema/transactions";
import { and, eq } from "drizzle-orm";

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

export async function getTagByTextQuery(
  client: DBClient,
  params: { text: string; userId: string },
) {
  const results = await client
    .select()
    .from(tag_table)
    .where(
      and(eq(tag_table.text, params.text), eq(tag_table.userId, params.userId)),
    );

  return results[0];
}
