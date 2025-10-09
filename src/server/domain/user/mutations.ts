"server-only";

import { eq } from "drizzle-orm";
import type { DBClient } from "~/server/db";
import type { DB_UserInsertType } from "~/server/db/schema/auth";
import { user as user_table } from "~/server/db/schema/auth";

export async function updateUserMutation(
  client: DBClient,
  input: Partial<DB_UserInsertType>,
  userId: string,
) {
  return await client
    .update(user_table)
    .set(input)
    .where(eq(user_table.id, userId))
    .returning();
}
