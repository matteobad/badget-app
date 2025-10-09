"server-only";

import { and, eq } from "drizzle-orm";
import type { DBClient } from "~/server/db";
import { tag_table } from "~/server/db/schema/transactions";

type CreateTagParams = {
  organizationId: string;
  name: string;
};

export const createTagMutation = async (
  db: DBClient,
  params: CreateTagParams,
) => {
  const { organizationId, name } = params;

  const [result] = await db
    .insert(tag_table)
    .values({
      organizationId,
      name,
    })
    .returning({
      id: tag_table.id,
      name: tag_table.name,
    });

  if (!result) {
    throw new Error("Failed to create tag");
  }

  return result;
};

type UpdateTagParams = {
  id: string;
  name: string;
  organizationId: string;
};

export const updateTagMutation = async (
  db: DBClient,
  params: UpdateTagParams,
) => {
  const { id, name, organizationId } = params;

  const [result] = await db
    .update(tag_table)
    .set({ name })
    .where(
      and(eq(tag_table.id, id), eq(tag_table.organizationId, organizationId)),
    )
    .returning({
      id: tag_table.id,
      name: tag_table.name,
    });

  if (!result) {
    throw new Error("Tag not found");
  }

  return result;
};

type DeleteTagParams = {
  id: string;
  organizationId: string;
};

export const deleteTagMutation = async (
  db: DBClient,
  params: DeleteTagParams,
) => {
  const { id, organizationId } = params;

  const [result] = await db
    .delete(tag_table)
    .where(
      and(eq(tag_table.id, id), eq(tag_table.organizationId, organizationId)),
    )
    .returning({
      id: tag_table.id,
      name: tag_table.name,
    });

  return result;
};
