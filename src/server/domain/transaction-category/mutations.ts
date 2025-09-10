"server-only";

import type { DBClient } from "~/server/db";
import type { DB_TransactionCategoryInsertType } from "~/server/db/schema/transactions";
import type { CategoryHierarchy } from "~/shared/types/category-types";
import { transaction_category_table } from "~/server/db/schema/transactions";
import { CATEGORIES } from "~/shared/constants/categories";
import { and, eq } from "drizzle-orm";

import {
  generateCategoryEmbedding,
  generateCategoryEmbeddingsBatch,
} from "./helpers";

type CreateTransactionCategoryParams = {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  excludeFromAnalitycs?: boolean;
  organizationId: string;
};

export async function createTransactionCategoryMutation(
  db: DBClient,
  params: CreateTransactionCategoryParams,
) {
  const [result] = await db
    .insert(transaction_category_table)
    .values({ ...params })
    .returning();

  if (result) {
    // Generate embedding for the new category (async, don't block the response)
    generateCategoryEmbedding(db, {
      name: result.name,
      system: false, // User-created category
    }).catch((error) => {
      console.error(
        `Failed to generate embedding for category "${result.name}":`,
        error,
      );
    });
  }

  return result;
}

export type CreateTransactionCategoriesParams = {
  organizationId: string;
  categories: {
    name: string;
    slug: string;
    color?: string | null;
    description?: string | null;
    parentId?: string | null;
  }[];
};

export const createTransactionCategoriesMutation = async (
  db: DBClient,
  params: CreateTransactionCategoriesParams,
) => {
  const { organizationId, categories } = params;

  if (categories.length === 0) {
    return [];
  }

  const result = await db
    .insert(transaction_category_table)
    .values(
      categories.map((category) => ({
        ...category,
        organizationId,
      })),
    )
    .returning();

  // Generate embeddings for all new categories (async, don't block the response)
  if (result.length > 0) {
    const categoryNames = result.map((category) => ({
      name: category.name,
      system: false, // User-created categories
    }));

    generateCategoryEmbeddingsBatch(db, categoryNames).catch((error) => {
      console.error(
        "Failed to generate embeddings for batch categories:",
        error,
      );
    });
  }

  return result;
};

type UpdateTransactionCategoryParams = {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  excludeFromAnalitycs?: boolean;
  organizationId: string;
};

export async function updateTransactionCategoryMutation(
  db: DBClient,
  params: UpdateTransactionCategoryParams,
) {
  const { id, organizationId, ...updates } = params;

  // If name is being updated, get the current category first
  let oldName: string | undefined;
  if (updates.name) {
    const [currentCategory] = await db
      .select({ name: transaction_category_table.name })
      .from(transaction_category_table)
      .where(
        and(
          eq(transaction_category_table.id, id),
          eq(transaction_category_table.organizationId, organizationId),
        ),
      )
      .limit(1);

    oldName = currentCategory?.name;
  }

  const [result] = await db
    .update(transaction_category_table)
    .set(updates)
    .where(
      and(
        eq(transaction_category_table.id, id),
        eq(transaction_category_table.organizationId, organizationId),
      ),
    )
    .returning();

  // If the name was updated, regenerate the embedding
  if (result && updates.name && oldName && updates.name !== oldName) {
    generateCategoryEmbedding(db, {
      name: updates.name,
      system: result.system ?? false,
    }).catch((error) => {
      console.error(
        `Failed to update embedding for category "${updates.name}":`,
        error,
      );
    });
  }

  return result;
}

type DeleteTransactionCategoryParams = {
  id: string;
  organizationId: string;
};

export async function deleteTransactionCategoryMutation(
  client: DBClient,
  params: DeleteTransactionCategoryParams,
) {
  const { id, organizationId } = params;
  return await client
    .update(transaction_category_table)
    .set({ deletedAt: new Date().toISOString() }) // soft delete
    .where(
      and(
        eq(transaction_category_table.id, id),
        eq(transaction_category_table.organizationId, organizationId),
      ),
    );
}

type CreateDefaultCategoriesForSpaceParams = {
  organizationId: string;
  countryCode?: string | null;
};

/**
 * Helper function to create system categories for a new space
 * Now supports unlimited hierarchy levels recursively
 */
export async function createDefaultCategoriesForSpace(
  db: DBClient,
  params: CreateDefaultCategoriesForSpaceParams,
) {
  // Map to track slug to ID for parent references
  const slugToId = new Map<string, string>();

  // Recursive function to process categories at any level
  async function processCategories(
    categories: CategoryHierarchy,
    parentId?: string,
  ): Promise<void> {
    const categoriesToInsert: DB_TransactionCategoryInsertType[] = [];

    // Prepare all categories at this level for insertion
    for (const category of categories) {
      categoriesToInsert.push({
        organizationId: params.organizationId,
        name: category.name,
        slug: category.slug,
        color: category.color,
        system: category.system,
        excludeFromAnalytics: category.excluded,
        description: undefined,
        parentId: parentId,
      });
    }

    // Insert categories at this level
    if (categoriesToInsert.length > 0) {
      const insertedCategories = await db
        .insert(transaction_category_table)
        .values(categoriesToInsert)
        .returning({
          id: transaction_category_table.id,
          slug: transaction_category_table.slug,
        });

      // Update the slug to ID mapping
      for (const inserted of insertedCategories) {
        slugToId.set(inserted.slug, inserted.id);
      }

      // Recursively process children of each inserted category
      for (const category of categories) {
        const categoryId = slugToId.get(category.slug);
        if (categoryId && category.children && category.children.length > 0) {
          await processCategories(category.children, categoryId);
        }
      }
    }
  }

  // Start processing from the root level
  console.log("CATEGORIES.length", CATEGORIES.length);
  await processCategories(CATEGORIES);
}
