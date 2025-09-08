"server-only";

import type { DBClient } from "~/server/db";
import { transaction_category_table } from "~/server/db/schema/transactions";
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
