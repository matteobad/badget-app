import type { getUncategorizedSchema } from "~/shared/validators/reports.schema";
import type {
  getAccountBalancesSchema,
  getRecurringExpensesSchema,
  getVaultActivitySchema,
} from "~/shared/validators/widgets.schema";
import type z from "zod";
import { count, sql } from "drizzle-orm";

import type { DBClient } from "../db";
import { account_table } from "../db/schema/accounts";
import { user } from "../db/schema/auth";
import { transaction_table } from "../db/schema/transactions";
import { getCombinedAccountBalanceQuery } from "../domain/bank-account/queries";
import { getRecentDocumentsQuery } from "../domain/documents/queries";
import {
  getRecurringExpensesQuery,
  getUncategorizedTransactionsQuery,
} from "../domain/transaction/queries";

export async function getCombinedAccountBalance(
  db: DBClient,
  params: z.infer<typeof getAccountBalancesSchema>,
  organizationId: string,
) {
  const accountBalances = await getCombinedAccountBalanceQuery(db, {
    organizationId,
    ...params,
  });

  return {
    result: accountBalances,
  };
}

export async function getRecurringExpenses(
  db: DBClient,
  params: z.infer<typeof getRecurringExpensesSchema>,
  organizationId: string,
) {
  const { from, to, currency: inputCurrency } = params;

  // Use existing getExpenses function for the specified period
  const recurringExpenses = await getRecurringExpensesQuery(db, {
    organizationId,
    from,
    to,
    currency: inputCurrency,
  });

  return recurringExpenses;
}

export async function getUncategorizedTransactions(
  db: DBClient,
  params: z.infer<typeof getUncategorizedSchema>,
  organizationId: string,
) {
  const { from, to, currency: inputCurrency } = params;

  // Use existing getExpenses function for the specified period
  const uncategorizedTransactions = await getUncategorizedTransactionsQuery(
    db,
    {
      organizationId,
      from,
      to,
      currency: inputCurrency,
    },
  );

  return uncategorizedTransactions;
}

export async function getRecentDocuments(
  db: DBClient,
  params: z.infer<typeof getVaultActivitySchema>,
  organizationId: string,
) {
  const recentDocuments = await getRecentDocumentsQuery(db, {
    organizationId,
    ...params,
  });

  return { result: recentDocuments };
}

interface HeroResultItem {
  users: number;
  accounts: number;
  transactions: number;
  transactionsValue: number;
}

export async function getHero(db: DBClient): Promise<HeroResultItem> {
  const userCountResult = await db.select({ count: count() }).from(user);

  const accountCountResult = await db
    .select({ count: count() })
    .from(account_table);

  const transactionCountResult = await db
    .select({ count: count() })
    .from(transaction_table);

  const transactionValueResult = await db
    .select({
      total: sql<number>`SUM(ABS(${transaction_table.amount}))`,
    })
    .from(transaction_table);

  return {
    users: userCountResult[0]?.count ?? 0,
    accounts: accountCountResult[0]?.count ?? 0,
    transactions: transactionCountResult[0]?.count ?? 0,
    transactionsValue: transactionValueResult[0]?.total ?? 0,
  };
}
