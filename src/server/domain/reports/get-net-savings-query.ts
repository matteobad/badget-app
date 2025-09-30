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
import { and, eq, gte, isNull, lte, ne, or, sql } from "drizzle-orm";

interface ReportsResultItem {
  value: string;
  date: string;
  currency: string;
}

export type GetNetSavingsParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

// Helper function for revenue calculation
export async function getNetSavingsQuery(
  db: DBClient,
  params: GetNetSavingsParams,
) {
  const { organizationId, from, to, currency: inputCurrency } = params;

  const fromDate = startOfMonth(new UTCDate(parseISO(from)));
  const toDate = endOfMonth(new UTCDate(parseISO(to)));

  // Step 2: Generate month series for complete results
  const monthSeries = eachMonthOfInterval({ start: fromDate, end: toDate });

  // Step 3: Build the main query conditions
  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.internal, false),
    eq(transaction_table.categorySlug, "income"),
    ne(transaction_table.status, "excluded"),
    gte(transaction_table.date, format(fromDate, "yyyy-MM-dd")),
    lte(transaction_table.date, format(toDate, "yyyy-MM-dd")),
  ];

  // Step 4: Execute the aggregated query with gross/net calculation
  const tc = transaction_category_table;
  const monthlyData = await db
    .select({
      month: sql<string>`DATE_TRUNC('month', ${transaction_table.date})::date`,
      value: sql<number>`SUM(${transaction_table.amount})`,
    })
    .from(transaction_table)
    .leftJoin(
      tc,
      and(
        eq(tc.slug, transaction_table.categorySlug),
        eq(tc.organizationId, organizationId),
      ),
    )
    .where(and(...conditions, or(isNull(tc.excluded), eq(tc.excluded, false))!))
    .groupBy(sql`DATE_TRUNC('month', ${transaction_table.date})`)
    .orderBy(sql`DATE_TRUNC('month', ${transaction_table.date}) ASC`);

  // Step 5: Create a map of month data for quick lookup
  const dataMap = new Map(monthlyData.map((item) => [item.month, item.value]));

  // Step 6: Generate complete results (optimized)
  const currencyStr = inputCurrency || "EUR";
  const results: ReportsResultItem[] = monthSeries.map((monthStart) => {
    const monthKey = format(monthStart, "yyyy-MM-dd");
    const value = dataMap.get(monthKey) || 0;

    return {
      date: monthKey,
      value: value.toString(),
      currency: currencyStr,
    };
  });

  return results;
}
