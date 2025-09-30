import type { DBClient } from "~/server/db";
import { UTCDate } from "@date-fns/utc";
import {
  transaction_category_table,
  transaction_table,
} from "~/server/db/schema/transactions";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import {
  and,
  eq,
  gte,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";

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
        ),
      ),
    );

  const totalAmount = Math.abs(totalAmountResult[0]?.total ?? 0);

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
        ),
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
          slug: item.slug ?? "unknown",
          amount: item.amount,
          currency: inputCurrency ?? "EUR",
          color: item.color ?? "#606060",
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
