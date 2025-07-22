import type { DBClient } from "~/server/db";
import type { AccountType, BankProviderType } from "~/server/db/schema/enum";
import type { DB_ConnectionInsertType } from "~/server/db/schema/open-banking";
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
  userId: string;
  provider: BankProviderType;
};

export const createBankConnectionMutation = async (
  db: DBClient,
  payload: CreateBankConnectionPayload,
) => {
  const { accounts, referenceId, userId, provider } = payload;

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
      userId,
      //lastAccessed: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: [connection_table.institutionId, connection_table.userId],
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
