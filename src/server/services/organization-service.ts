import type { createOrganizationSchema } from "~/shared/validators/organization.schema";
import type z from "zod";
import { headers } from "next/headers";

import type { DBClient } from "../db";
import { auth } from "../../shared/helpers/better-auth/auth";
import { createDefaultCategoriesForSpace } from "../domain/transaction-category/mutations";
import { getUserByIdQuery } from "../domain/user/queries";

export async function getUserById(db: DBClient, id: string) {
  return await getUserByIdQuery(db, id);
}

export async function createOrganization(
  db: DBClient,
  input: z.infer<typeof createOrganizationSchema>,
  userId: string,
) {
  try {
    const metadata = {
      baseCurrency: input.baseCurrency,
      countryCode: input.countryCode,
    };

    // Create organization
    const newOrg = await auth.api.createOrganization({
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

    if (!newOrg?.id) {
      throw new Error("Failed to create space.");
    }

    // Create system categories for the new team
    await createDefaultCategoriesForSpace(db, { organizationId: newOrg.id });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create space.");
  }
}
