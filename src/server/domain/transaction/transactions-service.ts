import type z from "zod";
import type { DBClient } from "~/server/db";
import type { getTransactionsSchema } from "~/shared/validators/transaction.schema";
import { getTransactionsQuery } from "./transactions-queries";

export async function getTransactions(
  db: DBClient,
  params: z.infer<typeof getTransactionsSchema>,
  organizationId: string,
) {
  return await getTransactionsQuery(db, { ...params, organizationId });
}
