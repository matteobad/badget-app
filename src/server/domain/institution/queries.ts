"server-only";

import type { DBClient } from "~/server/db";
import { institution_table } from "~/server/db/schema/open-banking";
import { and, arrayContains, desc, eq, ilike } from "drizzle-orm";

export type GetInstitutionsParams = {
  q?: string;
  originalId?: string;
  countryCode: string;
};

export async function getInstitutionsQuery(
  db: DBClient,
  params: GetInstitutionsParams,
) {
  const { q: search, countryCode, originalId } = params;

  const where = [arrayContains(institution_table.countries, [countryCode])];

  if (search) {
    where.push(ilike(institution_table.name, `%${search}%`));
  }

  if (originalId) {
    where.push(eq(institution_table.originalId, originalId));
  }

  return await db
    .select()
    .from(institution_table)
    .where(and(...where))
    .orderBy(desc(institution_table.popularity));
}
