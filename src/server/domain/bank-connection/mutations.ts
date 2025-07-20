import type { DBClient } from "~/server/db";
import type { DB_ConnectionInsertType } from "~/server/db/schema/open-banking";
import { connection_table } from "~/server/db/schema/open-banking";
import { and, eq } from "drizzle-orm";

export async function updateBankConnectionMutation(
  client: DBClient,
  value: Partial<DB_ConnectionInsertType>,
) {
  const { id, ...rest } = value;
  const [result] = await client
    .update(connection_table)
    .set({
      status: rest.status,
    })
    .where(and(eq(connection_table.id, id!)))
    .returning();

  return result;
}
