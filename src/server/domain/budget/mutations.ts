"server-only";

import type { DBClient } from "~/server/db";
import type { DB_BudgetInsertType } from "~/server/db/schema/budgets";
import { budget_instances, budget_table } from "~/server/db/schema/budgets";
import { and, eq } from "drizzle-orm";

export async function createBudgetMutation(
  client: DBClient,
  value: DB_BudgetInsertType,
) {
  const result = await client
    .insert(budget_table)
    .values(value)
    .onConflictDoNothing()
    .returning();
  await refreshBudgetInstances(client);

  return result;
}

export async function updateBudgetMutation(
  client: DBClient,
  params: Partial<DB_BudgetInsertType> & { id: string; userId: string },
) {
  const { id, userId, ...rest } = params;

  const result = await client
    .update(budget_table)
    .set(rest)
    .where(and(eq(budget_table.userId, userId), eq(budget_table.id, id)))
    .returning();
  await refreshBudgetInstances(client);

  return result;
}

export async function deleteBudgetMutation(
  client: DBClient,
  params: { id: string; userId: string },
) {
  const { id, userId } = params;

  const result = await client
    .delete(budget_table)
    .where(and(eq(budget_table.userId, userId), eq(budget_table.id, id)));
  await refreshBudgetInstances(client);

  return result;
}

async function refreshBudgetInstances(client: DBClient) {
  // Usa CONCURRENTLY solo se hai un indice unico sulla view
  await client.refreshMaterializedView(budget_instances).concurrently();
}
