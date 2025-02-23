"use server";

import { revalidateTag } from "next/cache";
import { and, eq } from "drizzle-orm";

import { authActionClient } from "~/lib/safe-action";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import {
  AccountDeleteSchema,
  AccountInsertSchema,
  AccountUpdateSchema,
} from "../utils/schemas";

export const createAccountAction = authActionClient
  .schema(AccountInsertSchema)
  .metadata({ actionName: "create-account" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db
      .insert(account_table)
      .values({ ...parsedInput, userId: ctx.userId });

    // Invalidate cache
    revalidateTag(`account_${ctx.userId}`);

    // Return success message
    return { message: "Category created" };
  });

export const updateAccountAction = authActionClient
  .schema(AccountUpdateSchema)
  .metadata({ actionName: "update-account" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db
      .update(account_table)
      .set({ ...parsedInput })
      .where(
        and(
          eq(account_table.userId, ctx.userId),
          eq(account_table.id, parsedInput.id),
        ),
      );

    // Invalidate cache
    revalidateTag(`account_${ctx.userId}`);

    // Return success message
    return { message: "Categoria aggiornata!" };
  });

export const deleteAccountAction = authActionClient
  .schema(AccountDeleteSchema)
  .metadata({ actionName: "delete-account" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db.transaction(async (tx) => {
      for (const id of parsedInput.ids) {
        await tx.delete(account_table).where(eq(account_table.id, id));
      }
    });

    // Invalidate cache
    revalidateTag(`account_${ctx.userId}`);

    // Return success message
    return { message: "Category deleted" };
  });
