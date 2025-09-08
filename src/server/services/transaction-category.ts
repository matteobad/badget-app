import type {
  createTransactionCategorySchema,
  deleteTransactionCategorySchema,
  getTransactionCategoriesSchema,
  getTransactionCategorySchema,
  updateTransactionCategorySchema,
} from "~/shared/validators/transaction-category.schema";
import type z from "zod";

import type { DBClient } from "../db";
import {
  createTransactionCategoryMutation,
  deleteTransactionCategoryMutation,
  updateTransactionCategoryMutation,
} from "../domain/transaction-category/mutations";
import {
  getTransactionCategoriesQuery,
  getTransactionCategoryQuery,
  getTransactionCategorySlugsQuery,
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

  return categories;

  // // First get all parent categories (categories with no parentId)
  // const parentCategories = categories.filter((c) => !c.parentId);

  // // Then get all child categories for these parents
  // const childCategories = categories.filter((c) => c.parentId);

  // // Group children by parentId for efficient lookup
  // const childrenByParentId = new Map<string, typeof childCategories>();
  // for (const child of childCategories) {
  //   if (child.parentId) {
  //     if (!childrenByParentId.has(child.parentId)) {
  //       childrenByParentId.set(child.parentId, []);
  //     }
  //     childrenByParentId.get(child.parentId)!.push(child);
  //   }
  // }

  // // Attach children to their parents
  // return parentCategories.map((parent) => ({
  //   ...parent,
  //   children: childrenByParentId.get(parent.id) ?? [],
  // }));
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
  client: DBClient,
  input: z.infer<typeof createTransactionCategorySchema>,
  organizationId: string,
) {
  // Get all existing categories slugs
  const existingSlugs = await getTransactionCategorySlugsQuery(client, {
    organizationId,
  });

  // Create category unique slug
  const existingSlugSet = new Set(existingSlugs.map((s) => s.slug));
  const baseSlug = input.name.toLowerCase().replaceAll(" ", "_");
  let uniqueSlug = baseSlug;
  let index = 1;

  while (existingSlugSet.has(uniqueSlug)) {
    uniqueSlug = `${baseSlug}_${index}`;
    index++;
  }

  // Persiste new category
  return await createTransactionCategoryMutation(client, {
    ...input,
    slug: uniqueSlug,
    organizationId,
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
  client: DBClient,
  input: z.infer<typeof deleteTransactionCategorySchema>,
  organizationId: string,
) {
  return await deleteTransactionCategoryMutation(client, {
    ...input,
    organizationId,
  });
}
