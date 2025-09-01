import { and, eq, inArray, sql } from "drizzle-orm";

import type { DBClient } from "../db";
import { account_table } from "../db/schema/accounts";

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

type GetNetWorthParams = {
  orgId: string;
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
  const { orgId, from, to, currency: inputCurrency } = params;

  const result = await db.execute(
    sql`SELECT * FROM ${sql.raw("get_net_worth")}(${orgId}, ${from}, ${to})`,
  );

  const rawData = result.rows as unknown as NetWorthResultItem[];

  const currentNetWorth =
    rawData && rawData.length > 0
      ? parseFloat(rawData[rawData.length - 1]?.value ?? "0")
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

  console.log("get_spending", orgId, from, to);

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

type GetAssetsParams = {
  orgId: string;
  from: string;
  to: string;
  currency?: string;
};

type AssetsResultItem = {
  total: number;
  currency: string;
};

export async function getAssets(db: DBClient, params: GetAssetsParams) {
  const { orgId, currency: inputCurrency } = params;

  const result = await db
    .select({
      total: sql`SUM(${account_table.balance})`.as("total"),
      currency: account_table.currency,
    })
    .from(account_table)

    .where(
      and(
        eq(account_table.organizationId, orgId),
        inArray(account_table.type, [
          "cash",
          "checking",
          "other_asset",
          "pension",
          "stock",
          "savings",
          "real_estate",
          "vehicle",
        ]),
      ),
    )
    .groupBy(account_table.currency);

  const rawData = result[0] as AssetsResultItem;

  return {
    summary: {
      totalAssets: Math.abs(rawData?.total ?? 0),
      currency: rawData?.currency ?? inputCurrency,
    },
    meta: {
      type: "assets",
      currency: rawData?.currency ?? inputCurrency,
    },
  };
}

type GetLiabilitiesParams = {
  orgId: string;
  from: string;
  to: string;
  currency?: string;
};

type LiabilitiesResultItem = {
  total: number;
  currency: string;
};

export async function getLiabilities(
  db: DBClient,
  params: GetLiabilitiesParams,
) {
  const { orgId, currency: inputCurrency } = params;

  const result = await db
    .select({
      total: sql`SUM(${account_table.balance})`.as("total"),
      currency: account_table.currency,
    })
    .from(account_table)

    .where(
      and(
        eq(account_table.organizationId, orgId),
        inArray(account_table.type, [
          "credit_card",
          "loan",
          "mortgage",
          "other_debt",
        ]),
      ),
    )
    .groupBy(account_table.currency);

  const rawData = result[0] as LiabilitiesResultItem;

  return {
    summary: {
      totalAssets: Math.abs(rawData?.total ?? 0),
      currency: rawData?.currency ?? inputCurrency,
    },
    meta: {
      type: "assets",
      currency: rawData?.currency ?? inputCurrency,
    },
  };
}
