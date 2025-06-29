"server-only";

import type { getBankAccountsSchema } from "~/shared/validators/bank-account.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { and, asc, desc, eq } from "drizzle-orm";

export async function getBankAccountsQuery(
  params: z.infer<typeof getBankAccountsSchema>,
  userId: string,
) {
  const { enabled, manual } = params;

  const results = await db
    .select()
    .from(account_table)
    .where(
      and(
        eq(account_table.userId, userId),
        enabled !== undefined ? eq(account_table.enabled, enabled) : undefined,
        manual !== undefined ? eq(account_table.manual, manual) : undefined,
      ),
    )
    .orderBy(asc(account_table.createdAt), desc(account_table.name));

  return results;
}
