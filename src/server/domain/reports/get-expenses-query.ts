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
import { and, eq, gte, isNull, lt, lte, ne, or, sql } from "drizzle-orm";

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
        ),
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
    const monthData = dataMap.get(monthKey) ?? {
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
