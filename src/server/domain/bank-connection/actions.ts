"use server";

import { redirect } from "next/navigation";
import { gocardlessClient } from "~/features/account/server/providers/gocardless/gocardless-api";
import { authActionClient } from "~/lib/safe-action";
import { createGocardlessLinkSchema } from "~/shared/validators/bank-connection.schema";
import z from "zod/v4";

export const createGocardlessLinkAction = authActionClient
  .inputSchema(createGocardlessLinkSchema)
  .metadata({ actionName: "create-gocardless-link" })
  .action(async ({ parsedInput }) => {
    const { institutionId, redirectBase, step } = parsedInput;

    const redirectTo = new URL(redirectBase);
    redirectTo.searchParams.append("step", step ?? "account");
    redirectTo.searchParams.append("provider", "gocardless");

    const institutionData = await gocardlessClient.getInstitutionById({
      id: institutionId,
    });

    if (!institutionData) {
      console.error("Failed to get institution");
      return;
    }

    const agreementData = await gocardlessClient.createAgreement({
      institution_id: institutionData.id,
      access_valid_for_days: institutionData.max_access_valid_for_days,
      max_historical_days: institutionData.transaction_total_days,
      access_scope: ["details", "balances", "transactions"],
    });

    if (!agreementData) {
      throw new Error("Failed to create agreement");
    }

    const requisition = await gocardlessClient.createRequisition({
      institution_id: institutionId,
      redirect: redirectTo.toString(),
      agreement: agreementData.id,
      user_language: "IT",
      // reference: TODO: investigate custom reference
      // account_selection: TODO: integrate account selcetion in the UI before
    });

    return redirect(requisition.link);
  });

export const sendSupportAction = authActionClient
  .inputSchema(
    z.object({
      subject: z.string(),
      priority: z.string(),
      type: z.string(),
      message: z.string(),
      url: z.string().optional(),
    }),
  )
  .metadata({
    actionName: "send-support",
  })
  .action(async () => {
    console.log("TODO");
  });
