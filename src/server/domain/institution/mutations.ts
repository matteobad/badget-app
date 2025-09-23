import type { DBClient } from "~/server/db";
import { institution_table } from "~/server/db/schema/open-banking";
import { eq, sql } from "drizzle-orm";

type UpdateInstitutionUsageParams = {
  id: string;
};

export async function updateInstitutionMutation(
  db: DBClient,
  params: UpdateInstitutionUsageParams,
) {
  const [result] = await db
    .update(institution_table)
    .set({
      popularity: sql`LEAST(${institution_table.popularity} + 1, 100)`,
    })
    .where(eq(institution_table.originalId, params.id))
    .returning();

  return result;
}
