import type {
  getAccountBalancesSchema,
  getCashFlowSchema,
  getMonthlySpendingSchema,
} from "~/shared/validators/widgets.schema";
import type z from "zod";
import { and, count, desc, eq, gt, gte, lt, lte, not, sql } from "drizzle-orm";

import type { DBClient } from "../db";
import {
  transaction_category_table,
  transaction_table,
} from "../db/schema/transactions";
import { getCombinedAccountBalanceQuery } from "../domain/bank-account/queries";
import {
  getCashFlowQuery,
  getExpensesQuery,
  getSpendingQuery,
} from "../domain/reports/queries";

// account-balances widget
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

// cash-flow widget
export async function getCashFlow(
  db: DBClient,
  params: z.infer<typeof getCashFlowSchema>,
  organizationId: string,
) {
  const cashFlowData = await getCashFlowQuery(db, {
    organizationId,
    ...params,
  });

  return {
    result: {
      netCashFlow: cashFlowData.summary.netCashFlow,
      currency: cashFlowData.summary.currency,
      period: cashFlowData.summary.period,
      meta: cashFlowData.meta,
    },
  };
}

// expenses widget
export async function getSpendingForPeriod(
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
  const spendingCategories = await getSpendingQuery(db, {
    organizationId,
    from,
    to,
    currency: inputCurrency,
  });

  const topCategory = spendingCategories[0] || null;

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

type GetIncomeParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

export async function getIncome(db: DBClient, params: GetIncomeParams) {
  const { organizationId, from, to, currency } = params;

  // Query base: transazioni positive
  const incomeTransactions = await db
    .select({
      id: transaction_table.id,
      name: transaction_table.name,
      amount: transaction_table.amount,
      date: transaction_table.date,
      category: transaction_table.categorySlug,
    })
    .from(transaction_table)
    .where(
      and(
        eq(transaction_table.organizationId, organizationId),
        gte(transaction_table.date, from),
        lte(transaction_table.date, to),
        gt(transaction_table.amount, 0),
      ),
    );

  if (incomeTransactions.length === 0) {
    return { total: 0, sources: [] };
  }

  // Calcolo totale
  const total = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Raggruppo per categoria (o account, o payee: dipende da UX)
  const grouped: Record<string, { name: string; amount: number }> = {};

  for (const tx of incomeTransactions) {
    const key = tx.category ?? "uncategorized";
    if (!grouped[key]) {
      grouped[key] = { name: key, amount: 0 };
    }
    grouped[key].amount += tx.amount;
  }

  // Trasformo in array e calcolo % sul totale
  const sources = Object.values(grouped)
    .map((g) => ({
      name: g.name,
      amount: g.amount,
      percentage: Math.round((g.amount / total) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    total,
    sources,
  };
}

export type GetIncomesParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

export async function getIncomes(db: DBClient, params: GetIncomesParams) {
  const { organizationId, from, to, currency } = params;

  const [result] = await db
    .select({
      income: sql`sum(${transaction_table.amount})`.mapWith(Number),
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
        eq(transaction_table.internal, false),
        gt(transaction_table.amount, 0),
        eq(transaction_category_table.excluded, false),
      ),
    );

  const grossIncome = result?.income ?? 0;

  return {
    summary: {
      grossIncome: grossIncome,
      currency,
    },
    meta: {
      type: "income",
      currency,
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

export type GetMonthlySpendingParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

export async function getMonthlySpending(
  db: DBClient,
  params: GetIncomesParams,
) {
  const { organizationId, from, to, currency } = params;

  const [result] = await db
    .select({
      spending: sql`sum(${transaction_table.amount}) * -1`.mapWith(Number),
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
        eq(transaction_table.internal, false),
        lt(transaction_table.amount, 0),
        eq(transaction_category_table.excluded, false),
      ),
    );

  return {
    summary: {
      amount: result?.spending ?? 0,
      currency,
    },
    meta: {
      type: "monthly-spending",
      currency,
    },
    result,
  };
}

export type GetCategoryExpensesParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

export async function getCategoryExpenses(
  db: DBClient,
  params: GetCategoryExpensesParams,
) {
  const { organizationId, from, to, currency } = params;

  // TODO: consider splits
  const result = await db
    .select({
      category: transaction_table.categorySlug,
      categoryColor: transaction_category_table.color,
      categoryName: transaction_category_table.name,
      total: sql`sum(${transaction_table.amount}) * -1`.mapWith(Number),
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
        lt(transaction_table.amount, 0), // spese → negative
        not(transaction_table.internal), // spese → incluse
        not(transaction_category_table.excluded), // categorie → incluse
      ),
    )
    .groupBy(
      transaction_table.categorySlug,
      transaction_category_table.color,
      transaction_category_table.name,
    )
    .orderBy(desc(sql`sum(${transaction_table.amount}) * -1`))
    .limit(3);

  return {
    summary: {
      // income: 0, TODO: to calculate percentage
      currency,
    },
    meta: {
      type: "category-expenses",
      currency,
    },
    result,
  };
}

export type GetRecurringParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

export async function getRecurring(db: DBClient, params: GetRecurringParams) {
  const { organizationId, from, to, currency } = params;

  const [result] = await db
    .select({
      recurring:
        sql`sum(case when ${transaction_table.recurring} = true then ${transaction_table.amount} else 0 end) * -1`.mapWith(
          Number,
        ),
      total: sql`sum(${transaction_table.amount}) * -1`.mapWith(Number),
    })
    .from(transaction_table)
    .where(
      and(
        eq(transaction_table.organizationId, organizationId),
        gte(transaction_table.date, from),
        lte(transaction_table.date, to),
        lt(transaction_table.amount, 0), // spese → negative
        not(transaction_table.internal), // spese → incluse
      ),
    );

  return {
    summary: {
      // income: 0, TODO: to calculate percentage
      currency,
    },
    meta: {
      type: "recurring",
      currency,
    },
    result,
  };
}

export type GetUncategorizedParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

export async function getUncategorized(
  db: DBClient,
  params: GetUncategorizedParams,
) {
  const { organizationId, from, to, currency } = params;

  // TODO: consider splits
  const [result] = await db
    .select({
      total: sql`sum(${transaction_table.amount}) * -1`.mapWith(Number),
      count: count(transaction_table.id),
    })
    .from(transaction_table)
    .where(
      and(
        eq(transaction_table.organizationId, organizationId),
        gte(transaction_table.date, from),
        lte(transaction_table.date, to),
        eq(transaction_table.categorySlug, "uncategorized"), // spese non categorizzate
      ),
    );

  return {
    summary: {
      // income: 0, TODO: to calculate percentage
      currency,
    },
    meta: {
      type: "uncategorized",
      currency,
    },
    result,
  };
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

export async function getNetWorth(db: DBClient, params: GetNetWorthParams) {
  const { organizationId, from, to, currency } = params;

  const result = await db.execute(
    sql`SELECT * FROM ${sql.raw("get_financial_metrics")}(${organizationId}, ${from}, ${to})`,
  );

  const rawData = result.rows as unknown as FinancialMetricsResultItem[];

  const netWorth =
    rawData && rawData.length > 0
      ? parseFloat(rawData[rawData.length - 1]?.net_worth ?? "0")
      : 0;

  return {
    summary: {
      netWorth: Math.abs(netWorth),
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
        value: value,
        currency: item.currency,
      };
    }),
  };
}
