"server-only";

import type { DBClient } from "~/server/db";
import type { DB_TransactionCategoryInsertType } from "~/server/db/schema/transactions";
import type { CategoryHierarchy } from "~/shared/types/category-types";
import { transaction_category_table } from "~/server/db/schema/transactions";
import { CATEGORIES } from "~/shared/constants/categories";
import { and, eq } from "drizzle-orm";

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
  client: DBClient,
  params: CreateTransactionCategoryParams,
) {
  return await client
    .insert(transaction_category_table)
    .values({ ...params })
    .onConflictDoNothing()
    .returning();
}

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
  client: DBClient,
  params: UpdateTransactionCategoryParams,
) {
  const { id, organizationId, ...rest } = params;
  return await client
    .update(transaction_category_table)
    .set(rest)
    .where(
      and(
        eq(transaction_category_table.id, id),
        eq(transaction_category_table.organizationId, organizationId),
      ),
    )
    .returning();
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
