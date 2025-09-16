"server-only";

import type { DBClient } from "~/server/db";
import type { DB_TransactionCategoryInsertType } from "~/server/db/schema/transactions";
import { transaction_category_table } from "~/server/db/schema/transactions";
import { CATEGORIES } from "~/shared/constants/categories";
import { and, eq } from "drizzle-orm";

import { generateCategoryEmbedding } from "./helpers";

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
  db: DBClient,
  params: DeleteTransactionCategoryParams,
) {
  const [result] = await db
    .delete(transaction_category_table)
    .where(
      and(
        eq(transaction_category_table.id, params.id),
        eq(transaction_category_table.organizationId, params.organizationId),
        eq(transaction_category_table.system, false),
      ),
    )
    .returning();

  return result;
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
  // Since teams have no previous categories on creation, we can insert all categories directly
  const categoriesToInsert: DB_TransactionCategoryInsertType[] = [];

  // First, add all parent categories
  for (const parent of CATEGORIES) {
    categoriesToInsert.push({
      organizationId: params.organizationId,
      name: parent.name,
      slug: parent.slug,
      color: parent.color,
      icon: parent.icon,
      system: parent.system,
      excluded: parent.excluded,
      description: undefined,
      parentId: undefined, // Parent categories have no parent
    });
  }

  // Insert all parent categories first
  const insertedParents = await db
    .insert(transaction_category_table)
    .values(categoriesToInsert)
    .returning({
      id: transaction_category_table.id,
      slug: transaction_category_table.slug,
    });

  // Create a map of parent slug to parent ID for child category references
  const parentSlugToId = new Map(
    insertedParents.map((parent) => [parent.slug, parent.id]),
  );

  // Now add all child categories with proper parent references
  const childCategoriesToInsert: DB_TransactionCategoryInsertType[] = [];

  for (const parent of CATEGORIES) {
    const parentId = parentSlugToId.get(parent.slug);
    if (parentId) {
      for (const child of parent.children) {
        childCategoriesToInsert.push({
          organizationId: params.organizationId,
          name: child.name,
          slug: child.slug,
          color: child.color,
          icon: child.icon,
          system: child.system,
          excluded: child.excluded,
          description: undefined,
          parentId: parentId,
        });
      }
    }
  }

  // Insert all child categories
  if (childCategoriesToInsert.length > 0) {
    await db.insert(transaction_category_table).values(childCategoriesToInsert);
  }
}
