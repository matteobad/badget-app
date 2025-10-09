import type z from "zod";
import { getDocuments as getDocumentsQuery } from "~/server/domain/documents/queries";
import type { getDocumentsSchema } from "~/shared/validators/documents.schema";

import type { DBClient } from "../db";

export async function getDocuments(
  db: DBClient,
  params: z.infer<typeof getDocumentsSchema>,
  organizationId: string,
) {
  return await getDocumentsQuery(db, { ...params, organizationId });
}
