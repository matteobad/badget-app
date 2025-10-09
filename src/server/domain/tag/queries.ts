"server-only";

import type { SQL } from "drizzle-orm";
import { and, eq, sql } from "drizzle-orm";
import type { DBClient } from "~/server/db";
import { tag_table } from "~/server/db/schema/transactions";

export type GetTagsParams = {
  q?: string;
  organizationId: string;
};

export const getTagsQuery = async (db: DBClient, params: GetTagsParams) => {
  const { q, organizationId } = params;

  // Always start with orgId filter
  const whereConditions: (SQL | undefined)[] = [
    eq(tag_table.organizationId, organizationId),
  ];

  // Search query filter (name)
  if (q) {
    const nameCondition = sql`${tag_table.name} ILIKE '%' || ${q} || '%'`;
    whereConditions.push(nameCondition);
  }

  const results = await db
    .select({
      id: tag_table.id,
      name: tag_table.name,
      organizationId: tag_table.organizationId,
      createdAt: tag_table.createdAt,
    })
    .from(tag_table)
    .where(and(...whereConditions))
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
