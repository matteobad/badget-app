import type { updateUserSchema } from "~/shared/validators/user.schema";
import type z from "zod/v4";
import { headers } from "next/headers";
import { auth } from "~/shared/helpers/better-auth/auth";

import type { DBClient } from "../db";
import { getUserByIdQuery } from "../domain/user/queries";

export async function getUserById(db: DBClient, id: string) {
  return await getUserByIdQuery(db, id);
}

export async function updateUser(params: z.infer<typeof updateUserSchema>) {
  const { email, ...userData } = params;

  // Update user data
  const data = await auth.api.updateUser({
    body: {
      ...userData,
    },
    // This endpoint requires session cookies.
    headers: await headers(),
  });

  // Change email if needed
  if (email) {
    await auth.api.changeEmail({
      body: {
        newEmail: email,
        callbackURL: "/overview",
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });
  }

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
