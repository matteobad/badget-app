import type z from "zod";
import { auth } from "~/shared/helpers/better-auth/auth";
import type { getSpaceSchema } from "~/shared/validators/space.schema";

export async function getSpace(
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
