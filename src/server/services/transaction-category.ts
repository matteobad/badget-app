import { eq } from "drizzle-orm";
import type z from "zod";
import type {
  createManyTransactionCategorySchema,
  createTransactionCategorySchema,
  deleteTransactionCategorySchema,
  getTransactionCategoriesSchema,
  getTransactionCategorySchema,
  updateTransactionCategorySchema,
} from "~/shared/validators/transaction-category.schema";

import type { DBClient } from "../db";
import { transaction_category_table } from "../db/schema/transactions";
import {
  ensureUniqueSlugs,
  generateCategoryEmbedding,
  generateCategoryEmbeddingsBatch,
} from "../domain/transaction-category/helpers";
import {
  createDefaultCategoriesForSpace,
  createTransactionCategoriesMutation,
  createTransactionCategoryMutation,
  deleteTransactionCategoryMutation,
  updateTransactionCategoryMutation,
} from "../domain/transaction-category/mutations";
import {
  getTransactionCategoriesQuery,
  getTransactionCategoryQuery,
} from "../domain/transaction-category/queries";

// CRUD operation on Transaction Category
export async function getTransactionCategories(
  client: DBClient,
  input: z.infer<typeof getTransactionCategoriesSchema>,
  organizationId: string,
) {
  const categories = await getTransactionCategoriesQuery(client, {
    ...input,
    organizationId,
  });

  // First get all parent categories (categories with no parentId)
  const parentCategories = categories.filter((c) => !c.parentId);

  // Then get all child categories for these parents
  const childCategories = categories.filter((c) => c.parentId);

  // Group children by parentId for efficient lookup
  const childrenByParentId = new Map<string, typeof childCategories>();
  for (const child of childCategories) {
    if (child.parentId) {
      if (!childrenByParentId.has(child.parentId)) {
        childrenByParentId.set(child.parentId, []);
      }
      childrenByParentId.get(child.parentId)!.push(child);
    }
  }

  // Attach children to their parents
  return parentCategories.map((parent) => ({
    ...parent,
    children: childrenByParentId.get(parent.id) ?? [],
  }));
}

export async function getTransactionCategory(
  client: DBClient,
  input: z.infer<typeof getTransactionCategorySchema>,
  organizationId: string,
) {
  return await getTransactionCategoryQuery(client, {
    ...input,
    organizationId,
  });
}

export async function createTransactionCategory(
  db: DBClient,
  input: z.infer<typeof createTransactionCategorySchema>,
  organizationId: string,
) {
  // Ensure unique slugs for categories
  const [category] = await ensureUniqueSlugs(db, {
    categories: [input],
    organizationId,
  });

  if (!category) {
    // Should never happend!
    console.error("Failed to ensure unique slugs");
    throw new Error("Failed to ensure unique slugs");
  }

  // Persist new category
  return await db.transaction(async (tx) => {
    const result = await createTransactionCategoryMutation(tx, {
      ...input,
      slug: category.slug,
      organizationId,
    });

    if (result) {
      // Generate embedding for the new category (async, don't block the response)
      generateCategoryEmbedding(tx, {
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
  });
}

export async function createTransactionCategories(
  db: DBClient,
  input: z.infer<typeof createManyTransactionCategorySchema>,
  organizationId: string,
) {
  // Ensure unique slugs for categories
  const categories = await ensureUniqueSlugs(db, {
    categories: input,
    organizationId,
  });

  // Persist new categories
  await db.transaction(async (tx) => {
    const result = await createTransactionCategoriesMutation(tx, {
      categories,
      organizationId,
    });

    // Generate embeddings for all new categories (async, don't block the response)
    if (result.length > 0) {
      const categoryNames = result.map((category) => ({
        name: category.name,
        system: false, // User-created categories
      }));

      generateCategoryEmbeddingsBatch(tx, categoryNames).catch((error) => {
        console.error(
          "Failed to generate embeddings for batch categories:",
          error,
        );
      });
    }

    return result;
  });
}

export async function updateTransactionCategory(
  client: DBClient,
  input: z.infer<typeof updateTransactionCategorySchema>,
  organizationId: string,
) {
  return await updateTransactionCategoryMutation(client, {
    ...input,
    organizationId,
  });
}

export async function deleteTransactionCategory(
  db: DBClient,
  input: z.infer<typeof deleteTransactionCategorySchema>,
  organizationId: string,
) {
  await db.transaction(async (tx) => {
    const category = await getTransactionCategoryQuery(tx, {
      ...input,
      organizationId,
    });

    if (!category) {
      tx.rollback();
      throw new Error("Category not found");
    }

    return await deleteTransactionCategoryMutation(tx, {
      ...input,
      organizationId,
    });
  });
}

export async function resetDefaultTransactionCategories(
  client: DBClient,
  organizationId: string,
) {
  return await client.transaction(async (tx) => {
    await tx
      .delete(transaction_category_table)
      .where(eq(transaction_category_table.organizationId, organizationId));

    await createDefaultCategoriesForSpace(tx, { organizationId });
  });
}
