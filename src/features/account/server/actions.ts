"use server";

import { revalidateTag } from "next/cache";
import { and, eq } from "drizzle-orm";

import { authActionClient } from "~/lib/safe-action";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { connection_table } from "~/server/db/schema/open-banking";
import {
  AccountDeleteSchema,
  AccountInsertSchema,
  AccountUpdateSchema,
  ConnectionDeleteSchema,
  SyncConnectionSchema,
} from "../utils/schemas";
import { syncUserConnection_MUTATION } from "./queries";

export const syncConnectionAction = authActionClient
  .schema(SyncConnectionSchema)
  .metadata({ actionName: "sync-connection" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    try {
      await syncUserConnection_MUTATION(ctx.userId, parsedInput.ref);
    } catch (err) {
      console.error(err);
      return { message: "Sincronizzazione fallita" };
    }

    // Invalidate cache
    revalidateTag(`account_${ctx.userId}`);
    revalidateTag(`transaction_${ctx.userId}`);

    // Return success message
    return { message: "Sincronizzazione completata" };
  });

export const deleteConnectionAction = authActionClient
  .schema(ConnectionDeleteSchema)
  .metadata({ actionName: "delete-connection" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    // TODO: delete connection on provider too
    // const provider = getBankAccountProvider(parsedInput.provider);

    await db
      .delete(connection_table)
      .where(eq(connection_table.id, parsedInput.id));

    // Invalidate cache
    revalidateTag(`account_${ctx.userId}`);
    revalidateTag(`connection_${ctx.userId}`);

    // Return success message
    return { message: "connection-delete-success-message" };
  });

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
