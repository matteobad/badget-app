"use server";

import { redirect } from "next/navigation";
import { kv } from "@vercel/kv";
import { eq, sql } from "drizzle-orm";

import { env } from "~/env";
import { authActionClient } from "~/lib/safe-action";
import { createGoCardLessLinkSchema } from "~/lib/validators";
import { db, schema } from "~/server/db";
import { GoCardLessApi } from "~/server/providers/gocardless/gocardless-api";

const provider = new GoCardLessApi({
  kv: kv,
  envs: {
    GOCARDLESS_SECRET_ID: env.GOCARDLESS_SECRET_ID,
    GOCARDLESS_SECRET_KEY: env.GOCARDLESS_SECRET_KEY,
  },
});

export const createGoCardLessLinkAction = authActionClient
  .schema(createGoCardLessLinkSchema)
  .metadata({ actionName: "createGoCardLessLinkAction" })
  .action(
    async ({
      parsedInput: {
        institutionId,
        availableHistory,
        redirectBase,
        step = "account",
      },
    }) => {
      await db
        .update(schema.institutions)
        .set({
          popularity: sql`${schema.institutions.popularity} + 1`,
        })
        .where(eq(schema.institutions.id, institutionId));

      const redirectTo = new URL(redirectBase);

      redirectTo.searchParams.append("step", step);
      redirectTo.searchParams.append("provider", "gocardless");

      const agreement = await provider.createEndUserAgreement({
        institutionId,
        transactionTotalDays: availableHistory,
      });

      const data = await provider.buildLink({
        institutionId,
        agreement: agreement.id,
        redirect: redirectTo.toString(),
      });

      return redirect(data.link);
    },
  );
