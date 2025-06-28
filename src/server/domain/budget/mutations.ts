"server-only";

import type { DB_BudgetInsertType } from "~/server/db/schema/budgets";
import type {
  deleteBudgetSchema,
  updateBudgetSchema,
} from "~/shared/validators/budget.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { budget_table } from "~/server/db/schema/budgets";
import { eq } from "drizzle-orm";

export async function createBudgetMutation(value: DB_BudgetInsertType) {
  return await db.insert(budget_table).values(value).returning();
}

export async function updateBudgetMutation(
  params: z.infer<typeof updateBudgetSchema>,
) {
  const { id, ...rest } = params;
  await db.update(budget_table).set(rest).where(eq(budget_table.id, id));
}

export async function deleteTodoMutation(
  params: z.infer<typeof deleteBudgetSchema>,
) {
  await db
    .update(budget_table)
    .set({ deletedAt: new Date() }) // soft delete
    .where(eq(budget_table.id, params.id));
}
