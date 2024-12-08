import { type UserJSON } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db, schema } from "..";

export async function upsertUser(payload: UserJSON) {
  const email = payload.email_addresses.find(
    (value) => value.id === payload.primary_email_address_id,
  )?.email_address;

  return await db
    .insert(schema.users)
    .values({
      userId: payload.id,
      email: email,
    })
    .onConflictDoUpdate({
      target: schema.users.userId,
      set: { email },
    });
}

export async function deleteUser(payload: UserJSON) {
  return await db
    .update(schema.users)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(schema.users.userId, payload.id));
}
