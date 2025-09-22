"server-only";

import type { DBClient } from "~/server/db";
import { tag_table } from "~/server/db/schema/transactions";
import { and, eq } from "drizzle-orm";

export type GetTagsParams = {
  organizationId: string;
};

export const getTagsQuery = async (db: DBClient, params: GetTagsParams) => {
  const { organizationId } = params;

  const results = await db
    .select({
      id: tag_table.id,
      name: tag_table.name,
      organizationId: tag_table.organizationId,
      createdAt: tag_table.createdAt,
    })
    .from(tag_table)
    .where(eq(tag_table.organizationId, organizationId))
    .orderBy(tag_table.name);

  return results;
};

type GetTagByIdParams = {
  id: string;
  organizationId: string;
};

export const getTagByIdQuery = async (
  db: DBClient,
  params: GetTagByIdParams,
) => {
  const { id, organizationId } = params;

  const [result] = await db
    .select({
      id: tag_table.id,
      name: tag_table.name,
      organizationId: tag_table.organizationId,
      createdAt: tag_table.createdAt,
    })
    .from(tag_table)
    .where(
      and(eq(tag_table.id, id), eq(tag_table.organizationId, organizationId)),
    );

  return result;
};
