"server-only";

import { eq } from "drizzle-orm";
import type { DBClient } from "~/server/db";
import { organization } from "~/server/db/schema/auth";

type GetOrganizationByIdParams = {
  id: string;
};

export async function getOrganizationByIdQuery(
  db: DBClient,
  params: GetOrganizationByIdParams,
) {
  const [result] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, params.id))
    .limit(1);

  return result;
}
