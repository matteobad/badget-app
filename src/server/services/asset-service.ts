import type {
  AccountSubtype,
  AccountType,
  BankProviderType,
} from "~/shared/constants/enum";
import type { getAssetsSchema } from "~/shared/validators/asset.schema";
import type z from "zod/v4";
import { and, eq, ilike, sql } from "drizzle-orm";

import type { DBClient } from "../db";
import { account_table } from "../db/schema/accounts";
import { connection_table, institution_table } from "../db/schema/open-banking";

type AssetData = {
  // group: AssetGroup;
  type: AccountType;
  subtype: AccountSubtype | null;
  id: string;
  name: string;
  description: string | null;
  balance: number;
  currency: string;
  lastUpdate: string;
  manual: boolean;
  provider?: BankProviderType | null;
  expiresAt?: string | null;
  logoUrl?: string | null;
};

export async function getAssets(
  client: DBClient,
  input: z.infer<typeof getAssetsSchema>,
  organizationId: string,
): Promise<AssetData[]> {
  // Always filter for organization
  const where = [eq(account_table.organizationId, organizationId)];

  if (input?.q) {
    where.push(ilike(account_table.name, `%${input.q}%`));
  }

  // 1. Get banking data
  const bankAccounts = await client
    .select({
      id: account_table.id,
      logoUrl: institution_table.logo,
      name: account_table.name,
      description: account_table.description,
      balance: account_table.balance,
      currency: account_table.currency,
      manual: account_table.manual,
      lastUpdate: sql<string>`coalesce(${account_table.updatedAt}, ${account_table.createdAt})`,
      provider: connection_table.provider,
      expiresAt: connection_table.expiresAt,
      type: account_table.type,
      subtype: account_table.subtype,
    })
    .from(account_table)
    .leftJoin(
      institution_table,
      eq(institution_table.id, account_table.institutionId),
    )
    .leftJoin(
      connection_table,
      eq(connection_table.id, account_table.connectionId),
    )
    .where(and(...where));

  // 2. Get investments data

  // 3. Get debts data

  // 4. Get other assets and liabilities

  // 5. Return normalized data
  return [...bankAccounts];
}
