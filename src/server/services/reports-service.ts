import type {
  getCashFlowSchema,
  getCategoryExpensesSchema,
  getMonthlyIncomeSchema,
  getMonthlySpendingSchema,
  getNetWorthSchema,
} from "~/shared/validators/widgets.schema";
import type z from "zod";
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
  getIncomeQuery,
  getTransactionsInPeriodQuery,
} from "../domain/transaction/queries";

export async function getCashFlow(
  db: DBClient,
  params: z.infer<typeof getCashFlowSchema>,
  organizationId: string,
) {
  const { from, to, currency: inputCurrency } = params;

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
    netCashFlow,
    currency,
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

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    currency,
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
    .slice(0, limit || 5);

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

export type GetSavingsParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

export async function getSavings(db: DBClient, params: GetSavingsParams) {
  const { organizationId, from, to, currency } = params;

  const result = await db
    .select({
      month: sql<Date>`date_trunc('month', ${transaction_table.date})`,
      income: sql`
      sum(case when ${transaction_table.amount} > 0 then ${transaction_table.amount} else 0 end)
    `.mapWith(Number),
      expenses: sql`
      sum(case when ${transaction_table.amount} < 0 then abs(${transaction_table.amount}) else 0 end)
    `.mapWith(Number),
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

  // Compute average delta (savings = income - expenses) over the result set
  let savings = 0;
  if (result && result.length > 0) {
    savings = result.reduce(
      (sum, row) => sum + ((row.income ?? 0) - (row.expenses ?? 0)),
      0,
    );
  }

  return {
    summary: {
      savings, // grossIncome: grossIncome,
      currency,
    },
    meta: {
      type: "savings",
      currency,
    },
    result,
  };
}
