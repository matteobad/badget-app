import type { DBClient } from "~/server/db";
import {
  transaction_category_table,
  transaction_table,
} from "~/server/db/schema/transactions";
import { and, eq, gte, lt, lte, sql } from "drizzle-orm";

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
    const frequency = (expense.frequency ?? "irregular") as
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
    frequency: (exp.frequency ?? "irregular") as
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
