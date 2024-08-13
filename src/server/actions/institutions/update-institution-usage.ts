"use server";

import { eq, sql } from "drizzle-orm";

import { authActionClient } from "~/lib/safe-action";
import { updateInstitutionUsageSchema } from "~/lib/validators";
import { db, schema } from "~/server/db";

export const updateInstitutionUsageAction = authActionClient
  .schema(updateInstitutionUsageSchema)
  .action(async ({ parsedInput: { institutionId } }) => {
    return await db
      .update(schema.institutions)
      .set({
        popularity: sql`${schema.institutions.popularity} + 1`,
      })
      .where(eq(schema.institutions.id, institutionId));
  });
