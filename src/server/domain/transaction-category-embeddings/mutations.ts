import { eq, sql } from "drizzle-orm";
import type { DBClient } from "~/server/db";
import { transaction_category_embeddings_table } from "~/server/db/schema/transactions";

export type GetCategoryEmbeddingParams = {
  name: string;
};

export const getCategoryEmbedding = async (
  db: DBClient,
  params: GetCategoryEmbeddingParams,
) => {
  const { name } = params;

  const [result] = await db
    .select()
    .from(transaction_category_embeddings_table)
    .where(eq(transaction_category_embeddings_table.name, name))
    .limit(1);

  return result;
};

export type CreateCategoryEmbeddingParams = {
  name: string;
  embedding: number[];
  system?: boolean;
  model?: string;
};

export const createCategoryEmbedding = async (
  db: DBClient,
  params: CreateCategoryEmbeddingParams,
) => {
  const {
    name,
    embedding,
    system = false,
    model = "gemini-embedding-001",
  } = params;

  const [result] = await db
    .insert(transaction_category_embeddings_table)
    .values({
      name,
      embedding,
      system,
      model,
    })
    .returning();

  return result;
};

export type UpsertCategoryEmbeddingParams = {
  name: string;
  embedding: number[];
  system?: boolean;
  model?: string;
};

export const upsertCategoryEmbedding = async (
  db: DBClient,
  params: UpsertCategoryEmbeddingParams,
) => {
  const {
    name,
    embedding,
    system = false,
    model = "gemini-embedding-001",
  } = params;

  const [result] = await db
    .insert(transaction_category_embeddings_table)
    .values({
      name,
      embedding,
      system,
      model,
    })
    .onConflictDoUpdate({
      target: transaction_category_embeddings_table.name,
      set: {
        embedding,
        model,
        updatedAt: sql`NOW()`,
      },
    })
    .returning();

  return result;
};
