"server-only";

import type { DBClient } from "~/server/db";
import type { DB_TransactionCategoryInsertType } from "~/server/db/schema/transactions";
import { transaction_category_table } from "~/server/db/schema/transactions";
import { and, eq } from "drizzle-orm";

export async function createCategoryMutation(
  client: DBClient,
  params: DB_TransactionCategoryInsertType,
) {
  return await client
    .insert(transaction_category_table)
    .values({ ...params })
    .onConflictDoNothing()
    .returning();
}

export async function createManyCategoryMutation(
  client: DBClient,
  params: DB_TransactionCategoryInsertType[],
) {
  return await client
    .insert(transaction_category_table)
    .values([...params])
    .onConflictDoNothing()
    .returning();
}

export async function updateCategoryMutation(
  client: DBClient,
  params: Partial<DB_TransactionCategoryInsertType>,
) {
  const { id, organizationId, ...rest } = params;
  return await client
    .update(transaction_category_table)
    .set(rest)
    .where(
      and(
        eq(transaction_category_table.id, id!),
        eq(transaction_category_table.organizationId, organizationId!),
      ),
    )
    .returning();
}

export async function deleteCategoryMutation(
  client: DBClient,
  params: { id: string; orgId: string },
) {
  const { id, orgId } = params;
  return await client
    .update(transaction_category_table)
    .set({ deletedAt: new Date().toISOString() }) // soft delete
    .where(
      and(
        eq(transaction_category_table.id, id),
        eq(transaction_category_table.organizationId, orgId),
      ),
    );
}
