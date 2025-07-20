"server-only";

import { db } from "~/server/db";
import { connection_table } from "~/server/db/schema/open-banking";
import { eq } from "drizzle-orm";

export async function getBankConnectionByIdQuery(id: string) {
  const [result] = await db
    .select()
    .from(connection_table)
    .where(eq(connection_table.id, id));

  return result;
}
