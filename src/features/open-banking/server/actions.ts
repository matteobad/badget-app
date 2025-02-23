"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";

import { authActionClient } from "~/lib/safe-action";
import { db } from "~/server/db";
import {
  connection_table,
  institution_table,
} from "~/server/db/schema/open-banking";
import { ConnectGocardlessSchema } from "../utils/schemas";
import { gocardlessClient } from "./providers/gocardless/gocardless-api";
import {
  mapRequisitionStatus,
  mapRequisitionValidity,
} from "./providers/gocardless/gocardless-mappers";

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
