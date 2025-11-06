import type z from "zod";
import type { DBClient } from "~/server/db";
import type {
  getTransactionByIdSchema,
  getTransactionsSchema,
} from "~/shared/validators/transaction.schema";
import {
  getTransactionByIdQuery,
  getTransactionsQuery,
} from "./transactions-queries";

export async function getTransactions(
  db: DBClient,
  params: z.infer<typeof getTransactionsSchema>,
  organizationId: string,
) {
  return await getTransactionsQuery(db, { ...params, organizationId });
}

export async function getTransactionById(
  db: DBClient,
  params: z.infer<typeof getTransactionByIdSchema>,
  organizationId: string,
) {
  return await getTransactionByIdQuery(db, { ...params, organizationId });
}
