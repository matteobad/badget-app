"server-only";

import type { DBClient } from "~/server/db";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { connection_table } from "~/server/db/schema/open-banking";
import { and, eq, sql } from "drizzle-orm";

export async function getBankConnectionByIdQuery(id: string) {
  const [result] = await db
    .select()
    .from(connection_table)
    .where(eq(connection_table.id, id));

  return result;
}

export type GetBankConnectionsParams = {
  userId: string;
  enabled?: boolean;
};

export async function getBankConnectionsQuery(
  db: DBClient,
  params: GetBankConnectionsParams,
) {
  const { userId, enabled } = params;

  const where = [eq(connection_table.userId, userId)];

  if (enabled !== undefined) {
    where.push(eq(account_table.enabled, enabled));
  }

  return await db
    .select({
      id: connection_table.id,
      name: connection_table.name,
      logoUrl: connection_table.logoUrl,
      provider: connection_table.provider,
      expiresAt: connection_table.expiresAt,
      institutionId: connection_table.institutionId,
      referenceId: connection_table.referenceId,
      status: connection_table.status,
      lastAccessed: connection_table.lastAccessed,
      bankAccounts: sql<
        Array<{
          id: string;
          name: string;
          enabled: boolean;
          manual: boolean;
          currency: string;
          balance: number;
          type: string;
          errorRetries: number | null;
        }>
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${account_table.id}, 'name', ${account_table.name}, 'enabled', ${account_table.enabled}, 'manual', ${account_table.manual}, 'currency', ${account_table.currency}, 'balance', ${account_table.balance}, 'type', ${account_table.type}, 'errorRetries', ${account_table.errorRetries})) FILTER (WHERE ${account_table.id} IS NOT NULL), '[]'::json)`.as(
        "bankAccounts",
      ),
    })
    .from(connection_table)
    .leftJoin(
      account_table,
      eq(account_table.connectionId, connection_table.id),
    )
    .where(and(...where))
    .groupBy(connection_table.id);
}
