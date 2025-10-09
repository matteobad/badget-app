"server-only";

import { eq } from "drizzle-orm";
import type { DBClient } from "~/server/db";
import { user } from "~/server/db/schema/auth";

export const getUserByIdQuery = async (db: DBClient, id: string) => {
  const [result] = await db.select().from(user).where(eq(user.id, id));

  return result;
};
