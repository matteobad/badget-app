"server-only";

import type { DBClient, TXType } from "~/server/db";
import type { DB_BudgetInsertType } from "~/server/db/schema/budgets";
import { budget_instances, budget_table } from "~/server/db/schema/budgets";
import { and, eq } from "drizzle-orm";

export async function createBudgetMutation(
  client: DBClient,
  value: DB_BudgetInsertType,
) {
  const [result] = await client
    .insert(budget_table)
    .values(value)
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function updateBudgetMutation(
  client: DBClient,
  value: Partial<DB_BudgetInsertType>,
) {
  const [result] = await client.update(budget_table).set(value).returning();

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

  return result;
}

export async function refreshBudgetInstances(tx: TXType) {
  // Usa CONCURRENTLY solo se hai un indice unico sulla view
  try {
    await tx.refreshMaterializedView(budget_instances);
  } catch (err) {
    console.error(err);
    return tx.rollback();
  }
}
