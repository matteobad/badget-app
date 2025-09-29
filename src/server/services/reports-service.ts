import { UTCDate } from "@date-fns/utc";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import {
  and,
  count,
  desc,
  eq,
  gt,
  gte,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  not,
  or,
  sql,
} from "drizzle-orm";

import type { DBClient } from "../db";
import { organization } from "../db/schema/auth";
import {
  transaction_category_table,
  transaction_table,
} from "../db/schema/transactions";

async function getTargetCurrency(
  db: DBClient,
  organizationId: string,
  inputCurrency?: string,
): Promise<string | null> {
  if (inputCurrency) return inputCurrency;

  // TODO: Check cache
  // const cached = teamCurrencyCache.get(teamId);
  // if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  //   return cached.currency;
  // }

  // Fetch from database
  const [space] = await db
    .select({ baseCurrency: organization.baseCurrency })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);

  const currency = space?.baseCurrency ?? null;
  // teamCurrencyCache.set(teamId, { currency, timestamp: Date.now() });

  return currency;
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

export type GetExpensesParams = {
  organizationId: string;
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
  const { organizationId, from, to, currency: inputCurrency } = params;

  const fromDate = startOfMonth(new UTCDate(parseISO(from)));
  const toDate = endOfMonth(new UTCDate(parseISO(to)));

  // Step 1: Get the target currency (cached)
  const targetCurrency = await getTargetCurrency(
    db,
    organizationId,
    inputCurrency,
  );

  // Step 2: Generate month series for complete results
  const monthSeries = eachMonthOfInterval({ start: fromDate, end: toDate });

  // Step 3: Build the main query conditions
  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    ne(transaction_table.status, "excluded"),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, format(fromDate, "yyyy-MM-dd")),
    lte(transaction_table.date, format(toDate, "yyyy-MM-dd")),
  ];

  // Add currency and amount conditions
  if (inputCurrency && targetCurrency) {
    conditions.push(
      and(
        eq(transaction_table.currency, targetCurrency),
        lt(transaction_table.amount, 0),
      )!,
    );
  }

  // Step 4: Execute the aggregated query
  const monthlyData = await db
    .select({
      month: sql<string>`DATE_TRUNC('month', ${transaction_table.date})::date`,
      value: sql<number>`COALESCE(SUM(
            CASE
              WHEN (${transaction_table.recurring} = false OR ${transaction_table.recurring} IS NULL) THEN ABS(${transaction_table.amount})
              ELSE 0
            END
          ), 0)`,
      recurringValue: sql<number>`COALESCE(SUM(
            CASE
              WHEN ${transaction_table.recurring} = true THEN ABS(${transaction_table.amount})
              ELSE 0
            END
          ), 0)`,
    })
    .from(transaction_table)
    .leftJoin(
      transaction_category_table,
      and(
        eq(transaction_category_table.slug, transaction_table.categorySlug),
        eq(transaction_category_table.organizationId, organizationId),
      ),
    )
    .where(
      and(
        ...conditions,
        or(
          isNull(transaction_table.categorySlug),
          isNull(transaction_category_table.excluded),
          eq(transaction_category_table.excluded, false),
        )!,
      ),
    )
    .groupBy(sql`DATE_TRUNC('month', ${transaction_table.date})`)
    .orderBy(sql`DATE_TRUNC('month', ${transaction_table.date}) ASC`);

  // Step 5: Create a map of month data for quick lookup
  const dataMap = new Map(
    monthlyData.map((item) => [
      item.month,
      { value: item.value, recurringValue: item.recurringValue },
    ]),
  );

  // Step 6: Generate complete results for all months in the series
  const rawData: ExpensesResultItem[] = monthSeries.map((monthStart) => {
    const monthKey = format(monthStart, "yyyy-MM-dd");
    const monthData = dataMap.get(monthKey) || {
      value: 0,
      recurringValue: 0,
    };

    return {
      date: monthKey,
      value: monthData.value.toString(),
      currency: targetCurrency ?? "EUR",
      recurring_value: monthData.recurringValue,
    };
  });

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
      averageExpense,
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
        value,
        currency: item.currency,
        recurring,
        total: Number((value + recurring).toFixed(2)),
      };
    }),
  };
}

export type GetSpendingParams = {
  organizationId: string;
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
  percentage: number;
}

export async function getSpending(
  db: DBClient,
  params: GetSpendingParams,
): Promise<SpendingResultItem[]> {
  const { organizationId, from, to, currency: inputCurrency } = params;

  const fromDate = startOfMonth(new UTCDate(parseISO(from)));
  const toDate = endOfMonth(new UTCDate(parseISO(to)));

  // Step 1: Get the target currency (cached)
  const targetCurrency = await getTargetCurrency(
    db,
    organizationId,
    inputCurrency,
  );

  // Step 2: Calculate total spending amount for percentage calculations
  const totalAmountConditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, format(fromDate, "yyyy-MM-dd")),
    lte(transaction_table.date, format(toDate, "yyyy-MM-dd")),
    lt(transaction_table.amount, 0),
  ];

  const totalAmountResult = await db
    .select({
      total: sql<number>`SUM(${transaction_table.amount})`,
    })
    .from(transaction_table)
    .leftJoin(
      transaction_category_table,
      and(
        eq(transaction_category_table.slug, transaction_table.categorySlug),
        eq(transaction_category_table.organizationId, organizationId),
      ),
    )
    .where(
      and(
        ...totalAmountConditions,
        or(
          isNull(transaction_table.categorySlug),
          isNull(transaction_category_table.excluded),
          eq(transaction_category_table.excluded, false),
        )!,
      ),
    );

  const totalAmount = Math.abs(totalAmountResult[0]?.total || 0);

  // Step 3: Get all spending data in a single aggregated query (MAJOR PERF WIN)
  const spendingConditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, format(fromDate, "yyyy-MM-dd")),
    lte(transaction_table.date, format(toDate, "yyyy-MM-dd")),
    lt(transaction_table.amount, 0),
    isNotNull(transaction_table.categorySlug), // Only categorized transactions
  ];

  // Single query replaces N queries (where N = number of categories)
  const categorySpending = await db
    .select({
      name: transaction_category_table.name,
      slug: transaction_category_table.slug,
      color: transaction_category_table.color,
      amount: sql<number>`ABS(SUM(${transaction_table.amount}))`,
    })
    .from(transaction_table)
    .innerJoin(
      transaction_category_table,
      and(
        eq(transaction_category_table.slug, transaction_table.categorySlug),
        eq(transaction_category_table.organizationId, organizationId),
      ),
    )
    .where(
      and(
        ...spendingConditions,
        or(
          isNull(transaction_category_table.excluded),
          eq(transaction_category_table.excluded, false),
        )!,
      ),
    )
    .groupBy(
      transaction_category_table.name,
      transaction_category_table.slug,
      transaction_category_table.color,
    )
    .having(sql`SUM(${transaction_table.amount}) < 0`)
    .then((results) =>
      results.map((item) => {
        const percentage =
          totalAmount !== 0 ? (item.amount / totalAmount) * 100 : 0;
        return {
          name: item.name,
          slug: item.slug || "unknown",
          amount: item.amount,
          currency: targetCurrency ?? "EUR",
          color: item.color || "#606060",
          percentage:
            percentage > 1
              ? Math.round(percentage)
              : Math.round(percentage * 100) / 100,
        };
      }),
    );

  // Step 5: Handle uncategorized transactions
  const uncategorizedConditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, format(fromDate, "yyyy-MM-dd")),
    lte(transaction_table.date, format(toDate, "yyyy-MM-dd")),
    lt(transaction_table.amount, 0),
    or(
      isNull(transaction_table.categorySlug),
      sql`NOT EXISTS (
        SELECT 1 FROM ${transaction_category_table} tc 
        WHERE tc.slug = ${transaction_table.categorySlug} 
        AND tc.organization_id = ${organizationId}
      )`,
    )!,
  ];

  const uncategorizedResult = await db
    .select({
      amount: sql<number>`SUM(${transaction_table.amount})`,
    })
    .from(transaction_table)
    .where(and(...uncategorizedConditions));

  const uncategorizedAmount = Math.abs(uncategorizedResult[0]?.amount || 0);

  if (uncategorizedAmount > 0) {
    const percentage =
      totalAmount !== 0 ? (uncategorizedAmount / totalAmount) * 100 : 0;

    categorySpending.push({
      name: "Uncategorized",
      slug: "uncategorized",
      amount: uncategorizedAmount,
      currency: targetCurrency ?? "EUR",
      color: "#606060",
      percentage:
        percentage > 1
          ? Math.round(percentage)
          : Math.round(percentage * 100) / 100,
    });
  }

  // Step 6: Sort by amount descending (highest first) and return
  return categorySpending
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      amount: Number.parseFloat(Number(item.amount).toFixed(2)),
      percentage: Number.parseFloat(Number(item.percentage).toFixed(2)),
    }));
}

export type GetSpendingForPeriodParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

export async function getSpendingForPeriod(
  db: DBClient,
  params: GetSpendingForPeriodParams,
) {
  const { organizationId, from, to, currency: inputCurrency } = params;

  // Use existing getExpenses function for the specified period
  const expensesData = await getExpenses(db, {
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
  const spendingCategories = await getSpending(db, {
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
