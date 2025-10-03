import type { DBClient } from "~/server/db";
import type { SQL } from "drizzle-orm/sql/sql";
import {
  document_table,
  document_tag_assignment_table,
} from "~/server/db/schema/documents";
import { transaction_attachment_table } from "~/server/db/schema/transactions";
import { buildSearchQuery } from "~/server/db/utils";
import { and, desc, eq, gte, inArray, like, lte, not, sql } from "drizzle-orm";

export type GetDocumentQueryParams = {
  organizationId: string;
  id?: string | null;
  filePath?: string | null;
};

export async function getDocumentById(
  db: DBClient,
  params: GetDocumentQueryParams,
) {
  const conditions = [eq(document_table.organizationId, params.organizationId)];

  if (params.id) {
    conditions.push(eq(document_table.id, params.id));
  }

  if (params.filePath) {
    conditions.push(eq(document_table.name, params.filePath));
  }

  return db.query.document_table.findFirst({
    where: and(...conditions),
    with: {
      documentTagAssignments: {
        with: {
          documentTag: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}

export type GetDocumentsParams = {
  organizationId: string;
  pageSize?: number;
  cursor?: string | null;
  language?: string | null;
  q?: string | null;
  tags?: string[] | null;
  start?: string | null;
  end?: string | null;
};

export async function getDocuments(db: DBClient, params: GetDocumentsParams) {
  const { organizationId, pageSize = 20, cursor, tags, q, start, end } = params;

  // Convert cursor to offset
  const offset = cursor ? Number.parseInt(cursor, 10) : 0;

  // Base conditions for the WHERE clause
  const whereConditions: SQL[] = [
    eq(document_table.organizationId, organizationId),
    not(like(document_table.name, "%.folderPlaceholder")),
  ];

  // Add date range conditions if provided
  if (start && end) {
    whereConditions.push(gte(document_table.date, start));
    whereConditions.push(lte(document_table.date, end));
  }

  // Add text search condition if query is provided
  if (q) {
    // Using the ftsEnglish field for text search with websearch format
    const searchQuery = buildSearchQuery(q);

    whereConditions.push(
      sql`${document_table.ftsEnglish} @@ to_tsquery('english', ${searchQuery})`,
    );
  }

  // For tag filtering, we need a specific approach
  if (tags && tags.length > 0) {
    // Get document IDs that match the tag filter
    const docIdsWithTags = await db
      .select({ documentId: document_tag_assignment_table.documentId })
      .from(document_tag_assignment_table)
      .where(
        and(
          eq(document_tag_assignment_table.organizationId, organizationId),
          inArray(document_tag_assignment_table.tagId, tags),
        ),
      );

    // Extract the document IDs
    const documentIds = docIdsWithTags.map((row) => row.documentId);

    // If no documents match the tags, return empty result early
    if (documentIds.length === 0) {
      return {
        meta: {
          cursor: undefined,
          hasPreviousPage: offset > 0,
          hasNextPage: false,
        },
        data: [],
      };
    }

    // Add the document ID filter
    whereConditions.push(inArray(document_table.id, documentIds));
  }

  // Execute the query
  const data = await db.query.document_table.findMany({
    where: and(...whereConditions),
    columns: {
      id: true,
      name: true,
      title: true,
      summary: true,
      date: true,
      metadata: true,
      pathTokens: true,
      processingStatus: true,
    },
    with: {
      documentTagAssignments: {
        with: {
          documentTag: true,
        },
      },
    },
    limit: pageSize,
    offset,
    orderBy: desc(document_table.createdAt),
  });

  // Generate next cursor (offset)
  const nextCursor =
    data.length === pageSize ? (offset + pageSize).toString() : undefined;

  return {
    meta: {
      cursor: nextCursor,
      hasPreviousPage: offset > 0,
      hasNextPage: data.length === pageSize,
    },
    data,
  };
}

export type GetRelatedDocumentsParams = {
  id: string;
  pageSize: number;
  organizationId: string;
};

export type GetRelatedDocumentsResponse = {
  id: string;
  name: string;
  metadata: Record<string, unknown>;
  path_tokens: string[];
  tag: string;
  title: string;
  summary: string;
  title_similarity: number;
};

export async function getRelatedDocuments(
  db: DBClient,
  params: GetRelatedDocumentsParams,
) {
  const { id, pageSize, organizationId } = params;

  const result = await db.execute(
    sql`SELECT * FROM match_similar_documents_by_title(${id}, ${organizationId}, ${0.3}, ${pageSize})`,
  );

  const rows = result.rows as GetRelatedDocumentsResponse[];

  return rows.map((result) => ({
    id: result.id,
    name: result.name,
    metadata: result.metadata,
    pathTokens: result.path_tokens,
    tag: result.tag,
    title: result.title,
    summary: result.summary,
  }));
}

export type DeleteDocumentParams = {
  id: string;
  organizationId: string;
};

export async function deleteDocument(
  db: DBClient,
  params: DeleteDocumentParams,
) {
  // First get the document to retrieve its path_tokens
  const [result] = await db
    .delete(document_table)
    .where(
      and(
        eq(document_table.id, params.id),
        eq(document_table.organizationId, params.organizationId),
      ),
    )
    .returning({
      id: document_table.id,
      pathTokens: document_table.pathTokens,
    });

  if (!result) {
    return null;
  }

  // Delete all transaction attachments that have the same path
  // Convert the array to PostgreSQL array literal format
  const pathArray = `{${result.pathTokens?.map((token) => `"${token}"`).join(",")}}`;

  await db
    .delete(transaction_attachment_table)
    .where(
      and(
        eq(transaction_attachment_table.organizationId, params.organizationId),
        sql`${transaction_attachment_table.path} @> ${pathArray}::text[] AND ${transaction_attachment_table.path} <@ ${pathArray}::text[]`,
      ),
    );

  return result;
}

export type UpdateDocumentsParams = {
  ids: string[];
  organizationId: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
};

export async function updateDocuments(
  db: DBClient,
  params: UpdateDocumentsParams,
) {
  const { ids, organizationId, processingStatus } = params;

  if (!ids) {
    return [];
  }

  return db
    .update(document_table)
    .set({ processingStatus })
    .where(
      and(
        eq(document_table.organizationId, organizationId),
        inArray(document_table.name, ids),
      ),
    )
    .returning();
}

export type UpdateDocumentByPathParams = {
  pathTokens: string[];
  organizationId: string;
  title?: string;
  summary?: string;
  content?: string;
  body?: string;
  tag?: string;
  date?: string;
  language?: string;
  processingStatus?: "pending" | "processing" | "completed" | "failed";
  metadata?: Record<string, unknown>;
};

export async function updateDocumentByPath(
  db: DBClient,
  params: UpdateDocumentByPathParams,
) {
  const {
    pathTokens,
    organizationId,
    title,
    summary,
    content,
    body,
    tag,
    date,
    language,
    processingStatus,
    metadata,
  } = params;

  if (!pathTokens || pathTokens.length === 0) {
    return null;
  }

  return db
    .update(document_table)
    .set({
      title,
      summary,
      content,
      body,
      tag,
      date,
      language,
      processingStatus,
      metadata,
    })
    .where(
      and(
        eq(document_table.organizationId, organizationId),
        eq(document_table.pathTokens, pathTokens),
      ),
    )
    .returning();
}

export type UpdateDocumentByFileNameParams = {
  fileName: string;
  organizationId: string;
  title?: string;
  summary?: string;
  content?: string;
  body?: string;
  tag?: string;
  date?: string;
  language?: string;
  processingStatus?: "pending" | "processing" | "completed" | "failed";
  metadata?: Record<string, unknown>;
};

export async function updateDocumentByFileName(
  db: DBClient,
  params: UpdateDocumentByFileNameParams,
) {
  const {
    fileName,
    organizationId,
    title,
    summary,
    content,
    body,
    tag,
    date,
    language,
    processingStatus,
    metadata,
  } = params;

  const [result] = await db
    .update(document_table)
    .set({
      title,
      summary,
      content,
      body,
      tag,
      date,
      language,
      processingStatus,
      metadata,
    })
    .where(
      and(
        eq(document_table.organizationId, organizationId),
        eq(document_table.name, fileName),
      ),
    )
    .returning({ id: document_table.id });

  return result;
}

export type UpdateDocumentProcessingStatusParams = {
  id: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
};

export async function updateDocumentProcessingStatus(
  db: DBClient,
  params: UpdateDocumentProcessingStatusParams,
) {
  const { id, processingStatus } = params;

  return db
    .update(document_table)
    .set({ processingStatus })
    .where(eq(document_table.id, id))
    .returning({ id: document_table.id });
}

export type GetRecentDocumentsParams = {
  organizationId: string;
  limit?: number;
};

export async function getRecentDocumentsQuery(
  db: DBClient,
  params: GetRecentDocumentsParams,
) {
  const { organizationId, limit = 5 } = params;

  const data = await db.query.document_table.findMany({
    where: and(
      eq(document_table.organizationId, organizationId),
      not(like(document_table.name, "%.folderPlaceholder")),
    ),
    columns: {
      id: true,
      name: true,
      title: true,
      createdAt: true,
      processingStatus: true,
      tag: true,
    },
    with: {
      documentTagAssignments: {
        with: {
          documentTag: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    limit,
    orderBy: desc(document_table.createdAt),
  });

  return {
    data,
    total: data.length,
  };
}
