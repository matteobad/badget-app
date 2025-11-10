import type z from "zod";
import type { DBClient } from "~/server/db";
import { auth } from "~/shared/helpers/better-auth/auth";
import type { getSpaceSchema } from "~/shared/validators/space.schema";
import { getOrganizationByIdQuery } from "./organization-queries";

export async function getSpace(
  db: DBClient,
  params: z.infer<typeof getSpaceSchema>,
) {
  const data = await getOrganizationByIdQuery(db, params);

  return data;
}

export async function getFullSpace(
  params: z.infer<typeof getSpaceSchema>,
  headers: Headers,
) {
  const data = await auth.api.getFullOrganization({
    headers,
    query: {
      organizationId: params.id,
      membersLimit: 100,
    },
  });

  return data;
}
