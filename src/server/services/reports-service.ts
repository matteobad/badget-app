import type {
  getCashFlowSchema,
  getCategoryExpensesSchema,
  getIncomeForecastSchema,
  getMonthlyIncomeSchema,
  getMonthlySpendingSchema,
  getNetWorthSchema,
  getSavingAnalysisSchema,
} from "~/shared/validators/widgets.schema";
import type z from "zod";
import { UTCDate } from "@date-fns/utc";
import { endOfMonth, format, parseISO } from "date-fns";
import { and, eq, gte, lte, not, sql } from "drizzle-orm";

import type { DBClient } from "../db";
import {
  transaction_category_table,
  transaction_table,
} from "../db/schema/transactions";
import { getNetWorthQuery } from "../domain/bank-account/queries";
import {
  getExpensesByCategoryQuery,
  getExpensesQuery,
  getIncomeByCategoryQuery,
  getIncomeQuery,
  getTransactionsInPeriodQuery,
} from "../domain/transaction/queries";

export async function getCashFlow(
  db: DBClient,
  params: z.infer<typeof getCashFlowSchema>,
  organizationId: string,
) {
  const { from, to, currency: inputCurrency, period } = params;

  const transactionsData = await getTransactionsInPeriodQuery(db, {
    organizationId,
    from,
    to,
  });

  // Calculate total income across all months in the period
  const netCashFlow = transactionsData.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const currency = inputCurrency ?? "EUR";

  return {
    summary: {
      netCashFlow: Number(netCashFlow.toFixed(2)),
      currency,
      period,
    },
    meta: {
      type: "cash_flow",
      currency,
      period: {
        from,
        to,
      },
    },
  };
}

export async function getNetWorthTrend(
  db: DBClient,
  params: z.infer<typeof getNetWorthSchema>,
  organizationId: string,
) {
  const { from, to, currency: inputCurrency } = params;

  const netWorthData = await getNetWorthQuery(db, {
    organizationId,
    from,
    to,
    currency: inputCurrency,
  });

  return netWorthData;
}

export async function getSavingsByMonth(
  db: DBClient,
  params: z.infer<typeof getSavingAnalysisSchema>,
  organizationId: string,
) {
  const { from, to, currency } = params;

  const result = await db
    .select({
      month: sql<Date>`date_trunc('month', ${transaction_table.date})`,
      saving: sql`sum(${transaction_table.amount})`.mapWith(Number),
      income:
        sql`ABS(sum(case when ${transaction_table.amount} > 0 then ${transaction_table.amount} else 0 end))`.mapWith(
          Number,
        ),
      expenses:
        sql`ABS(sum(case when ${transaction_table.amount} < 0 then ${transaction_table.amount} else 0 end))`.mapWith(
          Number,
        ),
    })
    .from(transaction_table)
    .leftJoin(
      transaction_category_table,
      and(
        eq(
          transaction_category_table.organizationId,
          transaction_table.organizationId,
        ),
        eq(transaction_category_table.slug, transaction_table.categorySlug),
      ),
    )
    .where(
      and(
        eq(transaction_table.organizationId, organizationId),
        gte(transaction_table.date, from),
        lte(transaction_table.date, to),
        not(transaction_table.internal),
        not(transaction_category_table.excluded),
      ),
    )
    .groupBy(sql`date_trunc('month', ${transaction_table.date})`)
    .orderBy(sql`date_trunc('month', ${transaction_table.date})`);

  // Compute total savings (savings = income - expenses) over the result set
  const totalSavings = result.reduce(
    (sum, row) => sum + ((row.income ?? 0) - (row.expenses ?? 0)),
    0,
  );

  // Compute average delta (savings = income - expenses) over the result set
  let averageSavings = 0;
  if (result && result.length > 0) {
    averageSavings =
      result.reduce(
        (sum, row) => sum + ((row.income ?? 0) - (row.expenses ?? 0)),
        0,
      ) / result.length;
  }

  return {
    summary: {
      totalSavings,
      averageSavings,
      currency,
    },
    meta: {
      type: "saving-analysis",
      currency,
    },
    result,
  };
}

export async function getIncomeByMonth(
  db: DBClient,
  params: z.infer<typeof getMonthlyIncomeSchema>,
  organizationId: string,
) {
  const { from, to, currency: inputCurrency } = params;

  // Use existing getExpenses function for the specified period
  const incomeData = await getIncomeQuery(db, {
    organizationId,
    from,
    to,
    currency: inputCurrency,
  });

  // Calculate total income across all months in the period
  const totalIncome = incomeData.result.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const currency = incomeData.meta.currency ?? inputCurrency ?? "EUR";

  // Get top spending category for the specified period using existing getSpending function
  const incomeCategories = await getIncomeByCategoryQuery(db, {
    organizationId,
    from,
    to,
    currency: inputCurrency,
  });

  const topCategory = incomeCategories[0] ?? null;

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    currency,
    topCategory: topCategory
      ? {
          name: topCategory.name,
          amount:
            Math.round(((totalIncome * topCategory.percentage) / 100) * 100) /
            100,
          percentage: topCategory.percentage,
        }
      : null,
  };
}

export async function getExpensesByMonth(
  db: DBClient,
  params: z.infer<typeof getMonthlySpendingSchema>,
  organizationId: string,
) {
  const { from, to, currency: inputCurrency } = params;

  // Use existing getExpenses function for the specified period
  const expensesData = await getExpensesQuery(db, {
    organizationId,
    from,
    to,
    currency: inputCurrency,
  });

  // Calculate total spending across all months in the period
  const totalSpending = expensesData.result.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const currency = expensesData.meta.currency ?? inputCurrency ?? "EUR";

  // Get top spending category for the specified period using existing getSpending function
  const spendingCategories = await getExpensesByCategoryQuery(db, {
    organizationId,
    from,
    to,
    currency: inputCurrency,
  });

  const topCategory = spendingCategories[0] ?? null;

  return {
    totalSpending: Math.round(totalSpending * 100) / 100,
    currency,
    topCategory: topCategory
      ? {
          name: topCategory.name,
          amount:
            Math.round(((totalSpending * topCategory.percentage) / 100) * 100) /
            100,
          percentage: topCategory.percentage,
        }
      : null,
  };
}

export async function getExpensesByCategory(
  db: DBClient,
  params: z.infer<typeof getCategoryExpensesSchema>,
  organizationId: string,
) {
  const { from, to, currency: inputCurrency, limit } = params;

  const categoryExpenses = await getExpensesByCategoryQuery(db, {
    organizationId,
    from,
    to,
    currency: inputCurrency,
  });

  // Get top N categories by amount
  const topCategories = categoryExpenses
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit ?? 5);

  const totalAmount = topCategories.reduce((sum, cat) => sum + cat.amount, 0);

  return {
    result: {
      categories: topCategories,
      totalAmount,
      currency: topCategories[0]?.currency ?? inputCurrency ?? "EUR",
      totalCategories: categoryExpenses.length,
    },
  };
}

export type GetRevenueForecastParams = {
  organizationId: string;
  from: string;
  to: string;
  forecastMonths: number;
  currency?: string;
  revenueType?: "gross" | "net";
};

interface IncomeForecastDataPoint {
  date: string;
  value: number;
  currency: string;
  type: "actual" | "forecast";
}

export async function getIncomeForecast(
  db: DBClient,
  params: z.infer<typeof getIncomeForecastSchema>,
  organizationId: string,
) {
  const { from, to, forecastMonths, currency: inputCurrency } = params;

  // 1. Fetch historical income
  const historicalData = await getIncomeQuery(db, {
    organizationId,
    from,
    to,
    currency: inputCurrency,
  });

  const historical = historicalData.result.map((item) => ({
    date: item.date,
    value: Number(item.value),
    currency: item.currency,
  }));

  const currency = historical[0]?.currency ?? inputCurrency ?? "EUR";

  // 2. Se pochi dati → fallback a media semplice
  if (historical.length < 3) {
    const avgValue =
      historical.reduce((s, i) => s + i.value, 0) / (historical.length ?? 1);
    const lastValue = historical[historical.length - 1]?.value ?? avgValue;

    const forecast: IncomeForecastDataPoint[] = [];
    const currentDate = new UTCDate(parseISO(to));

    for (let i = 1; i <= forecastMonths; i++) {
      const forecastDate = endOfMonth(
        new UTCDate(currentDate.getFullYear(), currentDate.getMonth() + i, 1),
      );
      forecast.push({
        date: format(forecastDate, "yyyy-MM-dd"),
        value: Number(lastValue.toFixed(2)),
        currency,
        type: "forecast",
      });
    }

    return {
      summary: {
        nextMonthProjection: forecast[0]?.value ?? 0,
        totalProjectedIncome: forecast.reduce((s, i) => s + i.value, 0),
        currency,
        forecastStartDate: forecast[0]?.date,
      },
      historical: historical.map((h) => ({ ...h, type: "actual" as const })),
      forecast,
      combined: [
        ...historical.map((h) => ({ ...h, type: "actual" as const })),
        ...forecast,
      ],
      meta: {
        historicalMonths: historical.length,
        forecastMonths,
        method: "simple_average",
        currency,
      },
    };
  }

  // 3. Rimozione outlier (IQR)
  const values = historical.map((i) => i.value);
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)] ?? 0;
  const q3 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const cleaned = historical.map((item, idx) => {
    const isOutlier = item.value < lowerBound || item.value > upperBound;
    const isRecent = idx >= historical.length - 3;
    return { ...item, isOutlier: isOutlier && !isRecent };
  });

  // 4. Calcolo tasso di crescita medio pesato
  const growthRates: number[] = [];
  for (let i = 1; i < cleaned.length; i++) {
    const prev = cleaned[i - 1]!;
    const curr = cleaned[i]!;
    if (!prev.isOutlier && !curr?.isOutlier && prev?.value > 0) {
      growthRates.push((curr.value - prev.value) / prev.value);
    }
  }
  const avgGrowthRate =
    growthRates.reduce((s, r) => s + r, 0) / (growthRates.length ?? 1);

  // 5. Exponential smoothing baseline
  const alpha = 0.3;
  let smoothed = historical[0]?.value ?? 0;
  for (let i = 1; i < historical.length; i++) {
    smoothed = alpha * historical[i]!.value + (1 - alpha) * smoothed;
  }
  const lastActualValue = smoothed;

  // 6. Genera forecast
  const forecast: IncomeForecastDataPoint[] = [];
  const currentDate = new UTCDate(parseISO(to));
  for (let i = 1; i <= forecastMonths; i++) {
    const forecastDate = endOfMonth(
      new UTCDate(currentDate.getFullYear(), currentDate.getMonth() + i, 1),
    );
    const projectedValue = lastActualValue * (1 + avgGrowthRate) ** i;

    forecast.push({
      date: format(forecastDate, "yyyy-MM-dd"),
      value: Math.max(0, Number(projectedValue.toFixed(2))),
      currency,
      type: "forecast",
    });
  }

  // 7. Output finale
  return {
    summary: {
      nextMonthProjection: forecast[0]?.value ?? 0,
      avgMonthlyGrowthRate: Number((avgGrowthRate * 100).toFixed(2)),
      totalProjectedIncome: forecast.reduce((s, i) => s + i.value, 0),
      peakMonth: forecast.reduce((max, cur) =>
        cur.value > max.value ? cur : max,
      ),
      currency,
      forecastStartDate: forecast[0]?.date,
    },
    historical: historical.map((h) => ({ ...h, type: "actual" as const })),
    forecast,
    combined: [
      ...historical.map((h) => ({ ...h, type: "actual" as const })),
      ...forecast,
    ],
    meta: {
      historicalMonths: historical.length,
      forecastMonths,
      avgGrowthRate,
      currency,
      confidence: historical.length >= 12 ? "high" : "medium",
      method: "exponential_smoothing",
    },
  };
}
