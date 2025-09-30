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
