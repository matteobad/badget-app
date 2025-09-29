import type { DBClient } from "~/server/db";
import { UTCDate } from "@date-fns/utc";
import { organization } from "~/server/db/schema/auth";
import {
  transaction_category_table,
  transaction_table,
} from "~/server/db/schema/transactions";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { and, eq, gte, isNull, lte, ne, or, sql } from "drizzle-orm";

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

export type GetCashFlowParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
  period?: "monthly" | "quarterly";
};

export async function getCashFlow(db: DBClient, params: GetCashFlowParams) {
  const {
    organizationId,
    from,
    to,
    currency: inputCurrency,
    period = "monthly",
  } = params;

  const fromDate = startOfMonth(new UTCDate(parseISO(from)));
  const toDate = endOfMonth(new UTCDate(parseISO(to)));

  // Get target currency
  const targetCurrency = await getTargetCurrency(
    db,
    organizationId,
    inputCurrency,
  );

  // Build query conditions
  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.internal, false),
    ne(transaction_table.status, "excluded"),
    gte(transaction_table.date, format(fromDate, "yyyy-MM-dd")),
    lte(transaction_table.date, format(toDate, "yyyy-MM-dd")),
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

  const netCashFlow = Number(result[0]?.totalAmount || 0);

  return {
    summary: {
      netCashFlow: Number(netCashFlow.toFixed(2)),
      currency: targetCurrency || "EUR",
      period,
    },
    meta: {
      type: "cash_flow",
      currency: targetCurrency || "EUR",
      period: {
        from,
        to,
      },
    },
  };
}
