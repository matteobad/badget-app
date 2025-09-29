"server-only";

import type { DBClient } from "~/server/db";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { organization } from "~/server/db/schema/auth";
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

export async function getCombinedAccountBalance(
  db: DBClient,
  params: GetCombinedAccountBalanceParams,
) {
  const { organizationId, currency: targetCurrency } = params;

  // Get team's base currency if no target currency specified
  let baseCurrency = targetCurrency;
  if (!baseCurrency) {
    const team = await db
      .select({ baseCurrency: organization.baseCurrency })
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

    baseCurrency = team[0]?.baseCurrency ?? "EUR";
  }

  // Get all enabled bank accounts with their balances
  const accounts = await db.query.account_table.findMany({
    where: and(
      eq(account_table.organizationId, organizationId),
      eq(account_table.enabled, true),
    ),
    columns: {
      id: true,
      name: true,
      currency: true,
      balance: true,
      type: true,
      logoUrl: true,
    },
  });

  let totalBalance = 0;
  const accountBreakdown: Array<{
    id: string;
    name: string;
    originalBalance: number;
    originalCurrency: string;
    convertedBalance: number;
    convertedCurrency: string;
    type: string;
    logoUrl?: string;
  }> = [];

  for (const account of accounts) {
    const balance = Number(account.balance) || 0;
    const accountCurrency: string = account.currency || baseCurrency;

    let convertedBalance = balance;

    totalBalance += convertedBalance;

    accountBreakdown.push({
      id: account.id,
      name: account.name || "Unknown Account",
      originalBalance: balance,
      originalCurrency: accountCurrency,
      convertedBalance,
      convertedCurrency: baseCurrency,
      type: account.type || "depository",
      logoUrl: account.logoUrl || undefined,
    });
  }

  return {
    totalBalance: Math.round(totalBalance * 100) / 100,
    currency: baseCurrency,
    accountCount: accounts.length,
    accountBreakdown,
  };
}
