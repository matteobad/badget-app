"server-only";

import type { DBClient } from "~/server/db";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { connection_table } from "~/server/db/schema/open-banking";
import { and, eq } from "drizzle-orm";

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
    })
    .from(connection_table)
    .leftJoin(
      account_table,
      eq(account_table.connectionId, connection_table.id),
    )
    .where(and(...where));
}
