import { and, eq, sql } from "drizzle-orm";
import type { DBClient } from "~/server/db";
import { document_tag_table } from "~/server/db/schema/documents";

export const getDocumentTags = async (db: DBClient, organizationId: string) => {
  return db.query.document_tag_table.findMany({
    where: eq(document_tag_table.organizationId, organizationId),
    columns: {
      id: true,
      name: true,
    },
    orderBy: (document_tag_table, { desc }) => [
      desc(document_tag_table.createdAt),
    ],
  });
};

export type CreateDocumentTagParams = {
  name: string;
  organizationId: string;
  slug: string;
};

export const createDocumentTag = async (
  db: DBClient,
  params: CreateDocumentTagParams,
) => {
  const [result] = await db
    .insert(document_tag_table)
    .values({
      name: params.name,
      slug: params.slug,
      organizationId: params.organizationId,
    })
    .returning({
      id: document_tag_table.id,
      name: document_tag_table.name,
      slug: document_tag_table.slug,
    });

  return result;
};

export type DeleteDocumentTagParams = {
  id: string;
  organizationId: string;
};

export const deleteDocumentTag = async (
  db: DBClient,
  params: DeleteDocumentTagParams,
) => {
  const { id, organizationId } = params;

  const [result] = await db
    .delete(document_tag_table)
    .where(
      and(
        eq(document_tag_table.id, id),
        eq(document_tag_table.organizationId, organizationId),
      ),
    )
    .returning({
      id: document_tag_table.id,
    });

  return result;
};

export type UpsertDocumentTagParams = {
  name: string;
  slug: string;
  organizationId: string;
};

export const upsertDocumentTags = async (
  db: DBClient,
  params: UpsertDocumentTagParams[],
) => {
  if (params.length === 0) {
    return [];
  }

  return db
    .insert(document_tag_table)
    .values(params)
    .onConflictDoUpdate({
      target: [document_tag_table.slug, document_tag_table.organizationId],
      set: {
        name: sql`excluded.name`,
      },
    })
    .returning({
      id: document_tag_table.id,
      slug: document_tag_table.slug,
    });
};
