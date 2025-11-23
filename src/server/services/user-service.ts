import { headers } from "next/headers";
import type z from "zod/v4";
import { auth } from "~/shared/helpers/better-auth/auth";
import type {
  changeEmailSchema,
  changePasswordSchema,
  updateUserSchema,
} from "~/shared/validators/user.schema";

import type { DBClient } from "../db";
import { getUserByIdQuery } from "../domain/user/queries";

export async function getUserById(db: DBClient, id: string) {
  return await getUserByIdQuery(db, id);
}

export async function updateUserInformation(
  headers: Headers,
  params: z.infer<typeof updateUserSchema>,
) {
  const data = await auth.api.updateUser({
    headers,
    body: {
      ...params,
    },
  });

  return data;
}

export async function changeEmail(
  headers: Headers,
  params: z.infer<typeof changeEmailSchema>,
) {
  // Change email if needed
  const data = await auth.api.changeEmail({
    headers,
    body: {
      newEmail: params.email,
    },
  });

  return data;
}

export async function changePassword(
  headers: Headers,
  params: z.infer<typeof changePasswordSchema>,
) {
  const data = await auth.api.changePassword({
    headers,
    body: {
      ...params,
    },
  });

  return data;
}

export async function deleteUser() {
  // Delete user
  const data = await auth.api.deleteUser({
    body: {
      callbackURL: "/sign-in",
    },
    // This endpoint requires session cookies.
    headers: await headers(),
  });

  return data;
}
