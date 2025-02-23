"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";

import { gocardlessClient } from "~/lib/providers/gocardless/gocardless-api";
import {
  mapRequisitionStatus,
  mapRequisitionValidity,
} from "~/lib/providers/gocardless/gocardless-mappers";
import { authActionClient } from "~/lib/safe-action";
import {
  CategoryDeleteSchema,
  CategoryInsertSchema,
  CategoryUpdateSchema,
  ConnectGocardlessSchema,
  ToggleAccountSchema,
} from "~/lib/validators";
import { db } from "~/server/db";
import { MUTATIONS } from "~/server/db/queries";
import { category_table as categorySchema } from "./db/schema/categories";
import {
  connection_table as connectionSchema,
  institution_table as institutionSchema,
} from "./db/schema/open-banking";

export const connectGocardlessAction = authActionClient
  .schema(ConnectGocardlessSchema)
  .metadata({ actionName: "connect-gocardless" })
  .action(async ({ parsedInput, ctx }) => {
    const { institutionId, provider, redirectBase } = parsedInput;
    const redirectTo = new URL("/settings/sync", redirectBase);
    redirectTo.searchParams.append("provider", provider.toLowerCase());

    const upsertedId = await db
      .update(institutionSchema)
      .set({
        popularity: sql`${institutionSchema.popularity} + 1`,
      })
      .where(eq(institutionSchema.originalId, institutionId))
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

    await db.insert(connectionSchema).values({
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

export const toggleAccountAction = authActionClient
  .schema(ToggleAccountSchema)
  .metadata({ actionName: "toggle-account" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await MUTATIONS.toggleAccount({ ...parsedInput, userId: ctx.userId });

    // Invalidate cache
    revalidateTag(`connection_${ctx.userId}`);
    revalidateTag(`account_${ctx.userId}`);

    // Return success message
    return { message: "Account toggled" };
  });

export const createCategoryAction = authActionClient
  .schema(CategoryInsertSchema)
  .metadata({ actionName: "create-category" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db
      .insert(categorySchema)
      .values({ ...parsedInput, userId: ctx.userId });

    // Invalidate cache
    revalidateTag(`category_${ctx.userId}`);

    // Return success message
    return { message: "Category created" };
  });

export const updateCategoryAction = authActionClient
  .schema(CategoryUpdateSchema)
  .metadata({ actionName: "update-category" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db
      .update(categorySchema)
      .set({ ...parsedInput })
      .where(
        and(
          eq(categorySchema.userId, ctx.userId),
          eq(categorySchema.id, parsedInput.id),
        ),
      );

    // Invalidate cache
    revalidateTag(`category_${ctx.userId}`);

    // Return success message
    return { message: "Categoria aggiornata!" };
  });

export const deleteCategoryAction = authActionClient
  .schema(CategoryDeleteSchema)
  .metadata({ actionName: "delete-category" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db.transaction(async (tx) => {
      for (const id of parsedInput.ids) {
        await tx.delete(categorySchema).where(eq(categorySchema.id, id));
      }
    });

    // Invalidate cache
    revalidateTag(`category_${ctx.userId}`);

    // Return success message
    return { message: "Category deleted" };
  });
