import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  lt,
  lte,
  not,
  sql,
} from "drizzle-orm";

import type { DBClient } from "../db";
import {
  transaction_category_table,
  transaction_table,
} from "../db/schema/transactions";

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
      grossIncome:
        sql`sum(case when ${transaction_table.amount} > 0 then ${transaction_table.amount} else 0 end)`.mapWith(
          Number,
        ),
      netIncome: sql`sum(${transaction_table.amount})`.mapWith(Number),
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

  const netIncome = result?.netIncome ?? 0;
  const grossIncome = result?.grossIncome ?? 0;

  return {
    summary: {
      netIncome: netIncome,
      grossIncome: grossIncome,
      currency,
    },
    meta: {
      type: "income",
      currency,
    },
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
    .where(
      and(
        eq(transaction_table.organizationId, organizationId),
        gte(transaction_table.date, from),
        lte(transaction_table.date, to),
        lt(transaction_table.amount, 0),
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
