"server-only";

import type { DBClient } from "~/server/db";
import type { DB_BudgetInsertType } from "~/server/db/schema/budgets";
import { budget_table } from "~/server/db/schema/budgets";
import { and, eq } from "drizzle-orm";

export async function createBudgetMutation(
  client: DBClient,
  value: DB_BudgetInsertType,
) {
  return await client
    .insert(budget_table)
    .values(value)
    .onConflictDoNothing()
    .returning();
}

export async function updateBudgetMutation(
  client: DBClient,
  params: Partial<DB_BudgetInsertType> & { id: string; userId: string },
) {
  const { id, userId, ...rest } = params;
  return await client
    .update(budget_table)
    .set(rest)
    .where(and(eq(budget_table.userId, userId), eq(budget_table.id, id)))
    .returning();
}

export async function deleteBudgetMutation(
  client: DBClient,
  params: { id: string; userId: string },
) {
  const { id, userId } = params;
  return await client
    .delete(budget_table)
    .where(and(eq(budget_table.userId, userId), eq(budget_table.id, id)));
}
