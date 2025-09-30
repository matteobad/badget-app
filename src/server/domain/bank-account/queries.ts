"server-only";

import type { DBClient } from "~/server/db";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { institution_table } from "~/server/db/schema/open-banking";
import { and, asc, desc, eq, getTableColumns } from "drizzle-orm";

type GetBankAccountsQuery = {
  connectionId?: string;
  enabled?: boolean;
  manual?: boolean;
  orgId?: string;
};

export async function getBankAccountsQuery(params: GetBankAccountsQuery) {
  const { orgId, connectionId, enabled, manual } = params;

  const where = [];

  if (orgId) {
    where.push(eq(account_table.organizationId, orgId));
  }

  if (connectionId) {
    where.push(eq(account_table.connectionId, connectionId));
  }

  if (manual) {
    where.push(eq(account_table.manual, manual));
  }

  if (typeof enabled === "boolean") {
    where.push(eq(account_table.enabled, enabled));
  }

  const results = await db
    .select()
    .from(account_table)
    .where(and(...where))
    .orderBy(asc(account_table.createdAt), desc(account_table.name));

  return results;
}

type GetBankAccountByIdParams = {
  id: string;
  orgId: string;
};

export async function getBankAccountByIdQuery(
  params: GetBankAccountByIdParams,
) {
  const { id, orgId } = params;

  const [result] = await db
    .select({
      ...getTableColumns(account_table),
      institutionName: institution_table.name,
    })
    .from(account_table)
    .leftJoin(
      institution_table,
      eq(institution_table.id, account_table.institutionId),
    )
    .where(
      and(eq(account_table.id, id), eq(account_table.organizationId, orgId)),
    );

  return result;
}

export type GetCombinedAccountBalanceParams = {
  organizationId: string;
  currency?: string;
};

export async function getCombinedAccountBalanceQuery(
  db: DBClient,
  params: GetCombinedAccountBalanceParams,
) {
  // TODO: handle currency conversion when specified
  const { organizationId, currency } = params;

  // Get all enabled bank accounts with their balances
  const accounts = await db
    .select({
      id: account_table.id,
      name: account_table.name,
      currency: account_table.currency,
      balance: account_table.balance,
      type: account_table.type,
      subtype: account_table.subtype,
      logoUrl: account_table.logoUrl,
    })
    .from(account_table)
    .where(
      and(
        eq(account_table.organizationId, organizationId),
        eq(account_table.enabled, true),
      ),
    );

  const totalBalance = accounts.reduce(
    (tot, account) => (tot += account.balance),
    0,
  );

  return {
    totalBalance: Math.round(totalBalance * 100) / 100,
    currency,
    accountCount: accounts.length,
    accountBreakdown: accounts,
  };
}

type GetAssetsParams = {
  organizationId: string;
};

export async function getAssetsQuery(db: DBClient, params: GetAssetsParams) {
  const { organizationId } = params;

  // Get assets data
  const assetsData = await db
    .select({
      id: account_table.id,
      name: account_table.name,
      description: account_table.description,
      balance: account_table.balance,
      currency: account_table.currency,
      manual: account_table.manual,
      enabled: account_table.enabled,
      type: account_table.type,
      subtype: account_table.subtype,
    })
    .from(account_table)
    .where(
      and(
        eq(account_table.organizationId, organizationId),
        eq(account_table.type, "asset"),
        eq(account_table.enabled, true),
      ),
    );

  // Compute total balance of all assets
  const totalAssetsBalance = assetsData.reduce(
    (sum, asset) => sum + (asset.balance || 0),
    0,
  );

  // Add percentage field to each asset
  const assetsWithPercentage = assetsData.map((asset) => ({
    ...asset,
    percentage:
      totalAssetsBalance > 0
        ? Math.round((asset.balance / totalAssetsBalance) * 10000) / 100 // 2 decimals
        : 0,
  }));

  return assetsWithPercentage;
}

type GetLiabilitiesParams = {
  organizationId: string;
};

export async function getLiabilitiesQuery(
  db: DBClient,
  params: GetLiabilitiesParams,
) {
  const { organizationId } = params;

  // Get assets data
  const liabilitiesData = await db
    .select({
      id: account_table.id,
      name: account_table.name,
      description: account_table.description,
      balance: account_table.balance,
      currency: account_table.currency,
      manual: account_table.manual,
      enabled: account_table.enabled,
      type: account_table.type,
      subtype: account_table.subtype,
    })
    .from(account_table)
    .where(
      and(
        eq(account_table.organizationId, organizationId),
        eq(account_table.type, "liability"),
        eq(account_table.enabled, true),
      ),
    );

  // Compute total balance of all assets
  const totalLiabilitiesBalance = liabilitiesData.reduce(
    (sum, asset) => sum + (asset.balance || 0),
    0,
  );

  // Add percentage field to each asset
  const liabilitiesWithPercentage = liabilitiesData.map((asset) => ({
    ...asset,
    percentage:
      totalLiabilitiesBalance > 0
        ? Math.round((asset.balance / totalLiabilitiesBalance) * 10000) / 100 // 2 decimals
        : 0,
  }));

  return liabilitiesWithPercentage;
}
