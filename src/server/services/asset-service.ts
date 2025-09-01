import type { AccountType } from "~/shared/constants/enum";
import type { getAssetsSchema } from "~/shared/validators/asset.schema";
import type z from "zod/v4";
import { eq, sql } from "drizzle-orm";

import type { DBClient } from "../db";
import { account_table } from "../db/schema/accounts";
import { institution_table } from "../db/schema/open-banking";

type AssetData = {
  // group: AssetGroup;
  type: AccountType;
  id: string;
  name: string;
  balance: number;
  currency: string;
  lastUpdate: string;
  logoUrl?: string | null;
};

export async function getAssets(
  client: DBClient,
  input: z.infer<typeof getAssetsSchema>,
  organizationId: string,
): Promise<AssetData[]> {
  // 1. Get banking data
  const bankAccounts = await client
    .select({
      id: account_table.id,
      logoUrl: institution_table.logo,
      name: account_table.name,
      balance: account_table.balance,
      currency: account_table.currency,
      lastUpdate: sql<string>`coalesce(${account_table.updatedAt}, ${account_table.createdAt})`,
      // group: sql<AssetGroup>`liquid`,
      type: account_table.type,
    })
    .from(account_table)
    .leftJoin(
      institution_table,
      eq(institution_table.id, account_table.institutionId),
    )
    .where(eq(account_table.organizationId, organizationId));

  // 2. Get investments data

  // 3. Get debts data

  // 4. Get other assets and liabilities

  // 5. Return normalized data
  return [...bankAccounts];
}
