import type { DBClient } from "~/server/db";
import type { DB_InstitutionInsertType } from "~/server/db/schema/open-banking";
import { institution_table } from "~/server/db/schema/open-banking";
import { and, eq } from "drizzle-orm";

export async function updateInstitutionMutation(
  client: DBClient,
  value: Partial<DB_InstitutionInsertType>,
) {
  const { id, ...rest } = value;
  const [result] = await client
    .update(institution_table)
    .set({
      popularity: rest.popularity,
    })
    .where(and(eq(institution_table.id, id!)))
    .returning();

  return result;
}
