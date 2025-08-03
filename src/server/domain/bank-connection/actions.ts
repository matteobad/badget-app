"use server";

import { redirect } from "next/navigation";
import { createId } from "@paralleldrive/cuid2";
import { tasks } from "@trigger.dev/sdk/v3";
import { authActionClient } from "~/lib/safe-action";
import { gocardlessClient } from "~/server/integrations/open-banking/gocardless/gocardless-api";
import { type reconnectConnection } from "~/server/jobs/tasks/reconnect-connection";
import { type syncConnection } from "~/server/jobs/tasks/sync-connection";
import {
  createGocardlessLinkSchema,
  manualSyncConnectionSchema,
  reconnectConnectionSchema,
  reconnectGocardlessLinkSchema,
} from "~/shared/validators/bank-connection.schema";
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

export const manualSyncTransactionsAction = authActionClient
  .inputSchema(manualSyncConnectionSchema)
  .metadata({ actionName: "manual-sync-transactions" })
  .action(async ({ parsedInput: { connectionId } }) => {
    const event = await tasks.trigger<typeof syncConnection>(
      "sync-connection",
      {
        connectionId,
        manualSync: true,
      },
    );

    return event;
  });

export const reconnectConnectionAction = authActionClient
  .inputSchema(reconnectConnectionSchema)
  .metadata({ actionName: "reconnect-connection" })
  .action(
    async ({ parsedInput: { connectionId, provider }, ctx: { orgId } }) => {
      const event = await tasks.trigger<typeof reconnectConnection>(
        "reconnect-connection",
        {
          orgId,
          connectionId,
          provider,
        },
      );

      return event;
    },
  );

export const reconnectGocardlessLinkAction = authActionClient
  .inputSchema(reconnectGocardlessLinkSchema)
  .metadata({ actionName: "create-gocardless-link" })
  .action(
    async ({
      parsedInput: { id, institutionId, redirectTo },
      ctx: { orgId },
    }) => {
      const reference = `${orgId}:${createId()}`;

      const link = new URL(redirectTo);
      link.searchParams.append("id", id);

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
        reference,
      });

      if (!requisition) {
        throw new Error("Failed to create link");
      }

      return redirect(requisition.link);
    },
  );

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
