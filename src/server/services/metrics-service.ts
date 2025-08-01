import { sql } from "drizzle-orm";

import type { DBClient } from "../db";

export type GetExpensesParams = {
  userId: string;
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
  const { userId, from, to, currency: inputCurrency } = params;

  const result = await db.execute(
    sql`SELECT * FROM ${sql.raw("get_expenses")}(${userId}, ${from}, ${to}, ${inputCurrency ?? null})`,
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

type GetNetWorthParams = {
  userId: string;
  from: string;
  to: string;
  currency?: string;
};

type NetWorthResultItem = {
  date: string;
  value: string;
  currency: string;
};

export async function getNetWorth(db: DBClient, params: GetNetWorthParams) {
  const { userId, from, to, currency: inputCurrency } = params;

  const result = await db.execute(
    sql`SELECT * FROM ${sql.raw("get_net_worth")}(${userId}, ${from}, ${to})`,
  );

  const rawData = result.rows as unknown as NetWorthResultItem[];

  const averageNetWorth =
    rawData && rawData.length > 0
      ? Number(
          (
            rawData.reduce(
              (sum, item) => sum + Number.parseFloat(item.value),
              0,
            ) / rawData.length
          ).toFixed(2),
        )
      : 0;

  return {
    summary: {
      averageNetWorth: Math.abs(averageNetWorth),
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    meta: {
      type: "net_worth",
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    result: rawData?.map((item) => {
      const value = Number.parseFloat(
        Number.parseFloat(item.value || "0").toFixed(2),
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
  userId: string;
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
  const { userId, from, to, currency: inputCurrency } = params;

  const rawData = (await db.execute(
    sql`SELECT * FROM ${sql.raw("get_spending")}(${userId}, ${from}, ${to}, ${inputCurrency ?? null})`,
  )) as unknown as SpendingResultItem[];

  return Array.isArray(rawData)
    ? rawData.map((item) => ({
        ...item,
        amount: Number.parseFloat(Number(item.amount).toFixed(2)),
        percentage: Number.parseFloat(Number(item.percentage).toFixed(2)),
      }))
    : [];
}
