import type { createOrganizationSchema } from "~/shared/validators/organization.schema";
import type z from "zod/v4";
import { headers } from "next/headers";

import type { DBClient } from "../db";
import { auth } from "../auth/auth";
import { getUserByIdQuery } from "../domain/user/queries";

export async function getUserById(db: DBClient, id: string) {
  return await getUserByIdQuery(db, id);
}

export async function createOrganization(
  _db: DBClient,
  input: z.infer<typeof createOrganizationSchema>,
  userId: string,
) {
  const metadata = {
    baseCurrency: input.baseCurrency,
    countryCode: input.countryCode,
  };
  return await auth.api.createOrganization({
    body: {
      name: input.name, // required
      slug: input.name.toLocaleLowerCase().replaceAll(" ", "-"), // required
      logo: input.logoUrl,
      metadata,
      userId: userId, // server-only
      keepCurrentActiveOrganization: false,
    },
    // This endpoint requires session cookies.
    headers: await headers(),
  });
}
