import type { DBClient } from "../db";
import { getUserByIdQuery } from "../domain/user/queries";

export async function getUserById(db: DBClient, id: string) {
  return await getUserByIdQuery(db, id);
}
