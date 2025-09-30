import type { DBClient } from "~/server/db";
import { UTCDate } from "@date-fns/utc";
import {
  transaction_category_table,
  transaction_table,
} from "~/server/db/schema/transactions";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import {
  and,
  eq,
  gt,
  gte,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";

export type GetCashFlowParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
  period?: "monthly" | "quarterly";
};

export async function getCashFlowQuery(
  db: DBClient,
  params: GetCashFlowParams,
) {
  // TODO: handle currency conversion when specified by user
  const { organizationId, from, to, period = "monthly", currency } = params;

  // Build query conditions
  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.internal, false),
    ne(transaction_table.status, "excluded"),
    gte(transaction_table.date, from),
    lte(transaction_table.date, to),
  ];

  // Get all transactions with category exclusion
  const result = await db
    .select({
      totalAmount: sql<number>`COALESCE(SUM(${transaction_table.amount}), 0)`,
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
        // Exclude transactions in excluded categories
        or(
          isNull(transaction_table.categorySlug),
          isNull(transaction_category_table.excluded),
          eq(transaction_category_table.excluded, false),
        )!,
      ),
    );

  const netCashFlow = Number(result[0]?.totalAmount ?? 0);

  return {
    summary: {
      netCashFlow: Number(netCashFlow.toFixed(2)),
      currency: currency ?? "EUR",
      period,
    },
    meta: {
      type: "cash_flow",
      currency: currency ?? "EUR",
      period: {
        from,
        to,
      },
    },
  };
}

export type GetIncomeParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

interface IncomeResultItem {
  value: string;
  date: string;
  currency: string;
}

export async function getIncomeQuery(db: DBClient, params: GetIncomeParams) {
  const { organizationId, from, to, currency: inputCurrency } = params;

  const fromDate = startOfMonth(new UTCDate(parseISO(from)));
  const toDate = endOfMonth(new UTCDate(parseISO(to)));

  // Step 2: Generate month series for complete results
  const monthSeries = eachMonthOfInterval({ start: fromDate, end: toDate });

  // Step 3: Build the main query conditions
  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    ne(transaction_table.status, "excluded"),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, format(fromDate, "yyyy-MM-dd")),
    lte(transaction_table.date, format(toDate, "yyyy-MM-dd")),
    gt(transaction_table.amount, 0),
  ];

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
    monthlyData.map((item) => [item.month, { value: item.value }]),
  );

  // Step 6: Generate complete results for all months in the series
  const rawData: IncomeResultItem[] = monthSeries.map((monthStart) => {
    const monthKey = format(monthStart, "yyyy-MM-dd");
    const monthData = dataMap.get(monthKey) || {
      value: 0,
      recurringValue: 0,
    };

    return {
      date: monthKey,
      value: monthData.value.toString(),
      currency: inputCurrency ?? "EUR",
    };
  });

  const averageIncome =
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
      averageIncome,
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    meta: {
      type: "income",
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    result: rawData?.map((item) => {
      const value = Number.parseFloat(
        Number.parseFloat(item.value || "0").toFixed(2),
      );

      return {
        date: item.date,
        value,
        currency: item.currency,
        total: Number(value.toFixed(2)),
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

export async function getExpensesQuery(
  db: DBClient,
  params: GetExpensesParams,
) {
  const { organizationId, from, to, currency: inputCurrency } = params;

  const fromDate = startOfMonth(new UTCDate(parseISO(from)));
  const toDate = endOfMonth(new UTCDate(parseISO(to)));

  // Step 2: Generate month series for complete results
  const monthSeries = eachMonthOfInterval({ start: fromDate, end: toDate });

  // Step 3: Build the main query conditions
  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    ne(transaction_table.status, "excluded"),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, format(fromDate, "yyyy-MM-dd")),
    lte(transaction_table.date, format(toDate, "yyyy-MM-dd")),
    lt(transaction_table.amount, 0),
  ];

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
      currency: inputCurrency ?? "EUR",
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

export async function getSpendingQuery(
  db: DBClient,
  params: GetSpendingParams,
): Promise<SpendingResultItem[]> {
  const { organizationId, from, to, currency: inputCurrency } = params;

  const fromDate = startOfMonth(new UTCDate(parseISO(from)));
  const toDate = endOfMonth(new UTCDate(parseISO(to)));

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
          currency: inputCurrency ?? "EUR",
          color: item.color || "#606060",
          percentage:
            percentage > 1
              ? Math.round(percentage)
              : Math.round(percentage * 100) / 100,
        };
      }),
    );

  // Step 6: Sort by amount descending (highest first) and return
  return categorySpending
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      amount: Number.parseFloat(Number(item.amount).toFixed(2)),
      percentage: Number.parseFloat(Number(item.percentage).toFixed(2)),
    }));
}

export type GetRecurringExpensesParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

interface RecurringExpenseItem {
  name: string;
  amount: number;
  frequency: "weekly" | "monthly" | "annually" | "irregular";
  categoryName: string | null;
  categorySlug: string | null;
  lastDate: string;
}

export async function getRecurringExpensesQuery(
  db: DBClient,
  params: GetRecurringExpensesParams,
) {
  const { organizationId, from, to, currency: inputCurrency } = params;

  // Build conditions
  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.recurring, true),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, from),
    lte(transaction_table.date, to),
    lt(transaction_table.amount, 0), // Expenses only
  ];

  // Get all recurring expenses grouped by name and frequency
  const recurringExpenses = await db
    .select({
      name: transaction_table.name,
      frequency: transaction_table.frequency,
      categoryName: transaction_category_table.name,
      categorySlug: transaction_category_table.slug,
      amount: sql<number>`AVG(ABS(${transaction_table.amount}))`,
      count: sql<number>`COUNT(*)::int`,
      lastDate: sql<string>`MAX(${transaction_table.date})`,
    })
    .from(transaction_table)
    .leftJoin(
      transaction_category_table,
      and(
        eq(transaction_category_table.slug, transaction_table.categorySlug),
        eq(transaction_category_table.organizationId, organizationId),
      ),
    )
    .where(and(...conditions))
    .groupBy(
      transaction_table.name,
      transaction_table.frequency,
      transaction_category_table.name,
      transaction_category_table.slug,
    )
    .orderBy(sql`AVG(ABS(${transaction_table.amount})) DESC`)
    .limit(10);

  // Calculate totals by frequency
  const frequencyTotals = {
    weekly: 0,
    monthly: 0,
    annually: 0,
    irregular: 0,
  };

  let totalRecurringAmount = 0;

  for (const expense of recurringExpenses) {
    const amount = Number(expense.amount);
    const frequency = (expense.frequency || "irregular") as
      | "weekly"
      | "monthly"
      | "annually"
      | "irregular";

    // Convert all to monthly equivalent for comparison
    let monthlyEquivalent = 0;
    switch (frequency) {
      case "weekly":
        monthlyEquivalent = amount * 4.33; // Average weeks per month
        frequencyTotals.weekly += amount;
        break;
      case "monthly":
        monthlyEquivalent = amount;
        frequencyTotals.monthly += amount;
        break;
      case "annually":
        monthlyEquivalent = amount / 12;
        frequencyTotals.annually += amount;
        break;
      case "irregular":
        monthlyEquivalent = amount;
        frequencyTotals.irregular += amount;
        break;
    }

    totalRecurringAmount += monthlyEquivalent;
  }

  // Get currency from first expense or use target currency
  const currency = inputCurrency ?? "EUR";

  // Format expenses for return
  const expenses: RecurringExpenseItem[] = recurringExpenses.map((exp) => ({
    name: exp.name,
    amount: Number(Number(exp.amount).toFixed(2)),
    frequency: (exp.frequency || "irregular") as
      | "weekly"
      | "monthly"
      | "annually"
      | "irregular",
    categoryName: exp.categoryName,
    categorySlug: exp.categorySlug,
    lastDate: exp.lastDate,
  }));

  return {
    summary: {
      totalMonthlyEquivalent: Number(totalRecurringAmount.toFixed(2)),
      totalExpenses: recurringExpenses.length,
      currency,
      byFrequency: {
        weekly: Number((frequencyTotals.weekly || 0).toFixed(2)),
        monthly: Number((frequencyTotals.monthly || 0).toFixed(2)),
        annually: Number((frequencyTotals.annually || 0).toFixed(2)),
        irregular: Number((frequencyTotals.irregular || 0).toFixed(2)),
      },
    },
    expenses,
    meta: {
      type: "recurring_expenses",
      currency,
    },
  };
}
