"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";

import { gocardlessClient } from "~/features/account/server/providers/gocardless/gocardless-api";
import {
  mapRequisitionStatus,
  mapRequisitionValidity,
} from "~/features/account/server/providers/gocardless/gocardless-mappers";
import { authActionClient } from "~/lib/safe-action";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import {
  connection_table,
  institution_table,
} from "~/server/db/schema/open-banking";
import {
  AccountDeleteSchema,
  AccountInsertSchema,
  AccountUpdateSchema,
  ConnectGocardlessSchema,
  ConnectionDeleteSchema,
  ConnectionUpdateSchema,
  SyncConnectionSchema,
} from "../utils/schemas";
import { syncUserConnection_MUTATION } from "./queries";

export const connectGocardlessAction = authActionClient
  .schema(ConnectGocardlessSchema)
  .metadata({ actionName: "connect-gocardless" })
  .action(async ({ parsedInput, ctx }) => {
    const { institutionId, provider, redirectBase } = parsedInput;
    const redirectTo = new URL("/settings/sync", redirectBase);
    redirectTo.searchParams.append("provider", provider.toLowerCase());

    const upsertedId = await db
      .update(institution_table)
      .set({
        popularity: sql`${institution_table.popularity} + 1`,
      })
      .where(eq(institution_table.originalId, institutionId))
      .returning();

    const institution = await gocardlessClient.getInstitutionById({
      id: institutionId,
    });

    const agreement = await gocardlessClient.createAgreement({
      institution_id: institutionId,
      access_valid_for_days: institution.max_access_valid_for_days,
      max_historical_days: institution.transaction_total_days,
      access_scope: ["details", "balances", "transactions"],
    });

    const requisition = await gocardlessClient.createRequisition({
      institution_id: institution.id,
      redirect: redirectTo.toString(),
      agreement: agreement.id,
      user_language: "IT",
      // reference: TODO: investigate custom reference
      // account_selection: TODO: integrate account selcetion in the UI before
    });

    await db.insert(connection_table).values({
      institutionId: upsertedId[0]!.id,
      provider: provider,
      userId: ctx.userId,
      referenceId: requisition.id,
      status: mapRequisitionStatus(requisition.status),
      validUntil: mapRequisitionValidity(
        requisition.created,
        agreement.access_valid_for_days,
      ),
    });

    return redirect(requisition.link);
  });

export const updateConnectedAccountAction = authActionClient
  .schema(ConnectionUpdateSchema)
  .metadata({ actionName: "update-connected-account" })
  .action(async () => {
    return { message: "todo" };
  });

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
