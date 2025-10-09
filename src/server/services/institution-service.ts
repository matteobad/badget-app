import type z from "zod/v4";
import type {
  getInstitutionsSchema,
  updateInstitutionUsageSchema,
} from "~/shared/validators/institution.schema";

import type { DBClient } from "../db";
import { db } from "../db";
import { updateInstitutionMutation } from "../domain/institution/mutations";
import { getInstitutionsQuery } from "../domain/institution/queries";

export async function getInstitutions(
  input: z.infer<typeof getInstitutionsSchema>,
) {
  return await getInstitutionsQuery(db, input);
}

export async function updateInstitutionUsage(
  db: DBClient,
  input: z.infer<typeof updateInstitutionUsageSchema>,
) {
  return await updateInstitutionMutation(db, input);
}
