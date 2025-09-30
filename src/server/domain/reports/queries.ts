import type { DBClient } from "~/server/db";
import { UTCDate } from "@date-fns/utc";
import {
  transaction_category_table,
  transaction_table,
} from "~/server/db/schema/transactions";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { and, eq, gte, isNull, lte, ne, or, sql } from "drizzle-orm";

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
