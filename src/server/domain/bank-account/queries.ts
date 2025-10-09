"server-only";

import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import type { DBClient } from "~/server/db";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { institution_table } from "~/server/db/schema/open-banking";
import type { AccountSubtype, AccountType } from "~/shared/constants/enum";

type GetBankAccountsQuery = {
  q?: string;
  type?: AccountType;
  subtype?: AccountSubtype;
  connectionId?: string;
  enabled?: boolean;
  manual?: boolean;
  organizationId: string;
};

export async function getBankAccountsQuery(
  db: DBClient,
  params: GetBankAccountsQuery,
) {
  const { q, type, subtype, organizationId, connectionId, enabled, manual } =
    params;

  // Always start with orgId filter
  const whereConditions: (SQL | undefined)[] = [
    eq(account_table.organizationId, organizationId),
  ];

  // Search query filter (name, description)
  if (q) {
    const nameCondition = sql`${account_table.name} ILIKE '%' || ${q} || '%'`;
    const descriptionCondition = sql`${account_table.description} ILIKE '%' || ${q} || '%'`;
    whereConditions.push(or(nameCondition, descriptionCondition));
  }

  // Type filter (asset/liability)
  if (type) {
    whereConditions.push(eq(account_table.type, type));
  }

  // Subtype filter (cash/checking/savings...)
  if (subtype) {
    whereConditions.push(eq(account_table.subtype, subtype));
  }

  if (connectionId) {
    whereConditions.push(eq(account_table.connectionId, connectionId));
  }

  // Manual filter
  if (typeof manual === "boolean") {
    whereConditions.push(eq(account_table.manual, manual));
  }

  // Enabled filter
  if (typeof enabled === "boolean") {
    whereConditions.push(eq(account_table.enabled, enabled));
  }

  const results = await db
    .select({
      id: account_table.id,
      name: account_table.name,
      description: account_table.description,
      type: account_table.type,
      subtype: account_table.subtype,
      balance: account_table.balance,
      currency: account_table.currency,
      enabled: account_table.enabled,
      manual: account_table.manual,
      institution: {
        name: institution_table.name,
        logo: institution_table.logo,
      },
    })
    .from(account_table)
    .leftJoin(
      institution_table,
      eq(institution_table.id, account_table.institutionId),
    )
    .where(and(...whereConditions))
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
    (tot, account) => tot + account.balance,
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

type GetNetWorthParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

type FinancialMetricsResultItem = {
  date: string;
  assets: string;
  liabilities: string;
  net_worth: string;
  currency: string;
};

export async function getNetWorthQuery(
  db: DBClient,
  params: GetNetWorthParams,
) {
  const { organizationId, from, to, currency } = params;

  const result = await db.execute(
    sql`SELECT * FROM ${sql.raw("get_financial_metrics")}(${organizationId}, ${from}, ${to})`,
  );

  const rawData = result.rows as unknown as FinancialMetricsResultItem[];

  const netWorth =
    rawData && rawData.length > 0
      ? parseFloat(rawData[rawData.length - 1]?.net_worth ?? "0")
      : 0;

  // Compute average net worth over the period
  const averageNetWorth =
    rawData && rawData.length > 0
      ? rawData.reduce(
          (sum, item) => sum + parseFloat(item.net_worth ?? "0"),
          0,
        ) / rawData.length
      : 0;

  // Compute delta percentage between start and end net worth and return as a positive or negative number (e.g., 10 or -15)
  let deltaNetWorth = 0;
  if (rawData && rawData.length > 1) {
    const startNetWorth = parseFloat(rawData[0]?.net_worth ?? "0");
    const endNetWorth = parseFloat(
      rawData[rawData.length - 1]?.net_worth ?? "0",
    );
    let percentChange = 0;
    if (startNetWorth !== 0) {
      percentChange =
        ((endNetWorth - startNetWorth) / Math.abs(startNetWorth)) * 100;
    } else {
      // If start is zero, avoid division by zero; show 0 or 100% if end is not zero
      percentChange = endNetWorth !== 0 ? 100 : 0;
    }
    deltaNetWorth = Math.round(percentChange);
  } else if (rawData && rawData.length === 1) {
    // If only one data point, delta is 0
    deltaNetWorth = 0;
  }

  return {
    summary: {
      netWorth: netWorth,
      averageNetWorth: averageNetWorth,
      deltaNetWorth: deltaNetWorth,
      currency: rawData?.at(0)?.currency ?? currency,
    },
    meta: {
      type: "net_worth",
      currency: rawData?.at(0)?.currency ?? currency,
    },
    result: rawData?.map((item) => {
      const value = Number.parseFloat(
        Number.parseFloat(item.net_worth || "0").toFixed(2),
      );
      return {
        date: item.date,
        amount: value,
        average: averageNetWorth,
        currency: item.currency,
      };
    }),
  };
}
