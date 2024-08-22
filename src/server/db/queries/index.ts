import { auth } from "@clerk/nextjs/server";
import { endOfMonth, startOfMonth } from "date-fns";
import { and, desc, eq, gt, lt, sql } from "drizzle-orm";

import { db, schema } from "..";
import { CategoryType } from "../schema/enum";
import { bankTransactions, categories } from "../schema/open-banking";

export type GetUserBankAccountsParams = {
  userId: string;
  enabled?: boolean;
};

export async function getUserBankAccountsQuery(
  params: GetUserBankAccountsParams,
) {
  const { userId } = params;

  const data = await db.query.bankConnections.findMany({
    where: eq(schema.bankConnections.userId, userId),
    with: {
      bankAccount: {
        orderBy: desc(schema.bankAccounts.balance),
      },
    },
  });

  return data;
}

export type GetTransactionsParams = {
  userId: string;
};

export async function getTransactionsQuery(params: GetTransactionsParams) {
  const { userId } = params;

  // NOTE: used only for institution logo. Remove in the future
  const bankConnections = await db
    .select()
    .from(schema.bankConnections)
    .where(eq(schema.bankConnections.userId, userId));

  const data = await db
    .select()
    .from(schema.bankTransactions)
    .where(eq(schema.bankTransactions.userId, userId))
    .leftJoin(
      schema.bankAccounts,
      eq(schema.bankTransactions.accountId, schema.bankAccounts.accountId),
    )
    .leftJoin(
      schema.categories,
      eq(schema.bankTransactions.categoryId, schema.categories.id),
    )
    .limit(10)
    .orderBy(desc(schema.bankTransactions.date));

  return data.map((item) => {
    const connection = bankConnections.find(
      (bc) => bc.id === item.bank_accounts?.bankConnectionId,
    );

    return {
      ...item.bank_transactions,
      bankAccount: {
        institution: connection?.name,
        logoUrl: connection?.logoUrl,
        name: item.bank_accounts?.name,
      },
      category: {
        icon: item.categories?.icon,
        color: item.categories?.color,
        name: item.categories?.name,
      },
    };
  });
}

export type GetCategoriesParams = {
  userId: string;
};

export async function getCategoriesQuery(params: GetCategoriesParams) {
  const { userId } = params;

  const data = await db.query.categories.findMany({
    with: {
      budgets: {
        columns: {
          budget: true,
          period: true,
          activeFrom: true,
          categoryId: true,
        },
        where: lt(schema.categoryBudgets.activeFrom, new Date()),
        orderBy: desc(schema.categoryBudgets.activeFrom),
        limit: 1,
      },
    },
    where: eq(schema.categories.userId, userId),
    orderBy: desc(schema.categories.manual),
  });

  return data;
}

export type GetBankOverviewChartParams = {
  userId: string;
  // startDate: Date;
  // endDate: Date;
};

export async function getBankOverviewChartQuery({
  userId,
}: GetBankOverviewChartParams) {
  // TODO: temp
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const data = await db
    .select({
      date: sql`date_trunc('day', ${bankTransactions.date})`.as("date"),
      income_sum:
        sql`SUM(CASE WHEN ${categories.type} = 'INCOME' THEN ${bankTransactions.amount} ELSE 0 END)`.as(
          "income_sum",
        ),
      outcome_sum:
        sql`SUM(CASE WHEN ${categories.type} = 'OUTCOME' THEN ${bankTransactions.amount} ELSE 0 END)`.as(
          "outcome_sum",
        ),
    })
    .from(bankTransactions)
    .innerJoin(
      schema.categories,
      eq(bankTransactions.categoryId, schema.categories.id),
    )
    .where(
      and(
        eq(bankTransactions.userId, userId),
        gt(bankTransactions.date, startDate),
        lt(bankTransactions.date, endDate),
      ),
    )
    .groupBy(sql`date_trunc('day', ${bankTransactions.date})`)
    .orderBy(sql`date_trunc('day', ${bankTransactions.date})`);

  console.log(data);

  return data;
}
