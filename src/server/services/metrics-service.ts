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
