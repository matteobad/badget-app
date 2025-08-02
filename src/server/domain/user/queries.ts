"server-only";

import type { DBClient } from "~/server/db";
import { user } from "~/server/db/schema/auth";
import { eq } from "drizzle-orm";

export const getUserByIdQuery = async (db: DBClient, id: string) => {
  const [result] = await db.select().from(user).where(eq(user.id, id));

  return result;
};
