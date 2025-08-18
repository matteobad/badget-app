import type { updateUserSchema } from "~/shared/validators/user.schema";
import type z from "zod/v4";
import { headers } from "next/headers";
import { auth } from "~/shared/helpers/better-auth/auth";

import type { DBClient } from "../db";
import { updateUserMutation } from "../domain/user/mutations";
import { getUserByIdQuery } from "../domain/user/queries";

export async function getUserById(db: DBClient, id: string) {
  return await getUserByIdQuery(db, id);
}

export async function updateUser(
  db: DBClient,
  input: z.infer<typeof updateUserSchema>,
  userId: string,
) {
  if (input.defaultOrganizationId) {
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {
        organizationId: input.defaultOrganizationId,
      },
    });
  }

  return await updateUserMutation(db, input, userId);
}
