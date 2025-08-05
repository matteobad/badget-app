import type { MiddlewareHandler } from "hono";
import { headers } from "next/headers";
import { auth } from "~/shared/helpers/better-auth/auth";

/**
 * Database middleware that connects to the database and sets it on context
 */
export const withAuth: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  // Set database on context
  c.set("session", session);

  await next();
};
