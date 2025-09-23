import { count, sql } from "drizzle-orm";

import type { DBClient } from "../db";
import { account_table } from "../db/schema/accounts";
import { user } from "../db/schema/auth";
import { transaction_table } from "../db/schema/transactions";

export type GetExpensesParams = {
  orgId: string;
  from: string;
  to: string;
  currency?: string;
};

interface ExpensesResultItem {
  value: string;
  date: string;
  currency: string;
  recurring_value?: number;
}

export async function getExpenses(db: DBClient, params: GetExpensesParams) {
  const { orgId, from, to, currency: inputCurrency } = params;

  const result = await db.execute(
    sql`SELECT * FROM ${sql.raw("get_expenses")}(${orgId}, ${from}, ${to}, ${inputCurrency ?? null})`,
  );

  const rawData = result.rows as unknown as ExpensesResultItem[];

  const averageExpense =
    rawData && rawData.length > 0
      ? Number(
          (
            rawData.reduce(
              (sum, item) => sum + Number.parseFloat(item.value ?? "0"),
              0,
            ) / rawData.length
          ).toFixed(2),
        )
      : 0;

  return {
    summary: {
      averageExpense: Math.abs(averageExpense),
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    meta: {
      type: "expense",
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    result: rawData?.map((item) => {
      const value = Number.parseFloat(
        Number.parseFloat(item.value || "0").toFixed(2),
      );
      const recurring = Number.parseFloat(
        Number.parseFloat(
          item.recurring_value !== undefined
            ? String(item.recurring_value)
            : "0",
        ).toFixed(2),
      );
      return {
        date: item.date,
        value: Math.abs(value),
        currency: item.currency,
        recurring: Math.abs(recurring),
        total: Math.abs(value + recurring),
      };
    }),
  };
}

type GetFinancialMetricsParams = {
  orgId: string;
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

export async function getNetWorth(
  db: DBClient,
  params: GetFinancialMetricsParams,
) {
  const { orgId, from, to, currency: inputCurrency } = params;

  const result = await db.execute(
    sql`SELECT * FROM ${sql.raw("get_financial_metrics")}(${orgId}, ${from}, ${to})`,
  );

  const rawData = result.rows as unknown as FinancialMetricsResultItem[];

  const currentNetWorth =
    rawData && rawData.length > 0
      ? parseFloat(rawData[rawData.length - 1]?.net_worth ?? "0")
      : 0;

  return {
    summary: {
      currentNetWorth: Math.abs(currentNetWorth),
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    meta: {
      type: "net_worth",
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    result: rawData?.map((item) => {
      const value = Number.parseFloat(
        Number.parseFloat(item.net_worth || "0").toFixed(2),
      );
      return {
        date: item.date,
        value: value,
        currency: item.currency,
      };
    }),
  };
}

export async function getFinanancialMetrics(
  db: DBClient,
  params: GetFinancialMetricsParams,
) {
  const { orgId, from, to, currency: inputCurrency } = params;

  const result = await db.execute(
    sql`SELECT * FROM ${sql.raw("get_financial_metrics")}(${orgId}, ${from}, ${to})`,
  );

  const rawData = result.rows as unknown as FinancialMetricsResultItem[];

  const netNorth =
    rawData && rawData.length > 0
      ? parseFloat(rawData[rawData.length - 1]?.net_worth ?? "0")
      : 0;

  const assets =
    rawData && rawData.length > 0
      ? parseFloat(rawData[rawData.length - 1]?.assets ?? "0")
      : 0;

  const liabilities =
    rawData && rawData.length > 0
      ? parseFloat(rawData[rawData.length - 1]?.liabilities ?? "0")
      : 0;

  return {
    summary: {
      netWorth: Math.abs(netNorth),
      asset: Math.abs(assets),
      liability: Math.abs(liabilities),
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    meta: {
      type: "assets",
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    result: rawData?.map((item) => {
      const value = Number.parseFloat(
        Number.parseFloat(item.net_worth || "0").toFixed(2),
      );
      return {
        date: item.date,
        value: value,
        currency: item.currency,
      };
    }),
  };
}

export type GetSpendingParams = {
  orgId: string;
  from: string;
  to: string;
  currency?: string;
};

interface SpendingResultItem {
  name: string;
  slug: string;
  amount: number;
  currency: string;
  color: string;
  icon: string | null;
  percentage: number;
}

export async function getSpending(
  db: DBClient,
  params: GetSpendingParams,
): Promise<SpendingResultItem[]> {
  const { orgId, from, to, currency: inputCurrency } = params;

  const result = await db.execute(
    sql`SELECT * FROM ${sql.raw("get_spending")}(${orgId}, ${from}, ${to}, ${inputCurrency ?? null})`,
  );

  const rawData = result.rows as unknown as SpendingResultItem[];

  return Array.isArray(rawData)
    ? rawData.map((item) => ({
        ...item,
        amount: Number.parseFloat(Number(item.amount).toFixed(2)),
        percentage: Number.parseFloat(Number(item.percentage).toFixed(2)),
      }))
    : [];
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
