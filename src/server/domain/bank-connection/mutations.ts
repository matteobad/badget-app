import type { DBClient } from "~/server/db";
import type { DB_ConnectionInsertType } from "~/server/db/schema/open-banking";
import type { AccountType, BankProviderType } from "~/shared/constants/enum";
import { connection_table } from "~/server/db/schema/open-banking";
import { and, eq } from "drizzle-orm";

export type CreateBankConnectionPayload = {
  accounts: {
    accountId: string;
    institutionId: string;
    logoUrl?: string | null;
    name: string;
    bankName: string;
    currency: string;
    enabled: boolean;
    balance?: number;
    type: AccountType;
    accountReference?: string | null;
    expiresAt?: string | null;
  }[];
  referenceId?: string | null;
  orgId: string;
  provider: BankProviderType;
};

export const createBankConnectionMutation = async (
  db: DBClient,
  payload: CreateBankConnectionPayload,
) => {
  const { accounts, referenceId, orgId, provider } = payload;

  // Get first account to create a bank connection
  const account = accounts?.at(0);

  if (!account) {
    return;
  }

  // Create or update bank connection
  const [bankConnection] = await db
    .insert(connection_table)
    .values({
      institutionId: account.institutionId,
      name: account.bankName,
      logoUrl: account.logoUrl,
      provider,
      referenceId,
      expiresAt: account.expiresAt,
      organizationId: orgId,
      //lastAccessed: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: [connection_table.institutionId, connection_table.organizationId],
      set: {
        name: account.bankName,
        logoUrl: account.logoUrl,
        referenceId,
        expiresAt: account.expiresAt,
        //lastAccessed: new Date().toISOString(),
      },
    })
    .returning();

  return bankConnection;
};

export async function updateBankConnectionMutation(
  client: DBClient,
  value: Partial<DB_ConnectionInsertType>,
) {
  const { id, ...rest } = value;
  const [result] = await client
    .update(connection_table)
    .set({
      status: rest.status,
    })
    .where(and(eq(connection_table.id, id!)))
    .returning();

  return result;
}

type DeleteBankConnectionParams = {
  id: string;
  orgId: string;
};

export const deleteBankConnectionMutation = async (
  db: DBClient,
  params: DeleteBankConnectionParams,
) => {
  const { id, orgId } = params;

  const [result] = await db
    .delete(connection_table)
    .where(
      and(
        eq(connection_table.id, id),
        eq(connection_table.organizationId, orgId),
      ),
    )
    .returning({
      referenceId: connection_table.referenceId,
      provider: connection_table.provider,
    });

  return result;
};
