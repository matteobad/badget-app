import type { SQL } from "drizzle-orm";
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
  or,
  sql,
} from "drizzle-orm";
import { type z } from "zod";

import { filterColumn } from "~/lib/utils";
import { type transactionsSearchParamsSchema } from "~/lib/validators";
import { db, schema } from "..";
import { type CategoryType } from "../schema/enum";
import {
  bankAccounts,
  bankTransactions,
  categories,
  categoryBudgets,
} from "../schema/open-banking";
import { type DrizzleWhere } from "../utils";

export type GetUserBankAccountsParams = {
  userId: string;
  enabled?: boolean;
};

export async function getUserBankConnectionsQuery(
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

export async function getUserBankAccountsQuery(
  params: GetUserBankAccountsParams,
) {
  const { userId } = params;

  const data = await db.query.bankAccounts.findMany({
    where: eq(schema.bankAccounts.userId, userId),
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
        type: item.categories?.type,
      },
    };
  });
}

export async function getFilteredTransactionsQuery({
  params,
  userId,
}: {
  params: z.infer<typeof transactionsSearchParamsSchema>;
  userId: string;
}) {
  const { page, per_page, sort, query, operator, from, to, category, account } =
    params;

  // Offset to paginate the results
  const offset = (page - 1) * per_page;
  // Column and order to sort by
  // Spliting the sort string by "." to get the column and order
  // Example: "title.desc" => ["title", "desc"]
  const [column, order] = (sort?.split(".").filter(Boolean) ?? [
    "date",
    "desc",
  ]) as [
    keyof typeof bankTransactions.$inferSelect | undefined,
    "asc" | "desc" | undefined,
  ];

  // Convert the date strings to date objects
  const fromDay = from ? sql`to_date(${from}, 'yyyy-mm-dd')` : undefined;
  const toDay = to ? sql`to_date(${to}, 'yyy-mm-dd')` : undefined;

  const expressions: (SQL<unknown> | undefined)[] = [
    query
      ? filterColumn({
          column: bankTransactions.name,
          value: query,
        })
      : undefined,
    !!category
      ? filterColumn({
          column: bankTransactions.categoryId,
          value: category,
          isSelectable: true,
        })
      : undefined,
    !!account
      ? filterColumn({
          column: bankTransactions.accountId,
          value: account,
          isSelectable: true,
        })
      : undefined,
    // Filter by date
    fromDay && toDay
      ? and(
          gte(bankTransactions.date, fromDay),
          lte(bankTransactions.date, toDay),
        )
      : undefined,
  ];

  const where: DrizzleWhere<typeof bankTransactions.$inferSelect> =
    !operator || operator === "and" ? and(...expressions) : or(...expressions);

  // Transaction is used to ensure both queries are executed in a single transaction
  const { data, total } = await db.transaction(async (tx) => {
    // NOTE: used only for institution logo. Remove in the future
    const bankConnections = await tx
      .select()
      .from(schema.bankConnections)
      .where(eq(schema.bankConnections.userId, userId));

    const data = await tx
      .select()
      .from(bankTransactions)
      .limit(per_page)
      .offset(offset)
      .where(where)
      .leftJoin(
        bankAccounts,
        eq(bankAccounts.accountId, bankTransactions.accountId),
      )
      .leftJoin(categories, eq(categories.id, bankTransactions.categoryId))
      .orderBy(
        column && column in bankTransactions
          ? order === "asc"
            ? asc(bankTransactions[column])
            : desc(bankTransactions[column])
          : desc(bankTransactions.id),
      );

    const total = await tx
      .select({ count: count() })
      .from(bankTransactions)
      .where(where)
      .execute()
      .then((res) => res[0]?.count ?? 0);

    return {
      data: data.map((item) => {
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
      }),
      total,
    };
  });

  const pageCount = Math.ceil(total / per_page);
  return { data, pageCount };
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

export async function getCategoryBudgetsQuery(params: GetCategoriesParams) {
  const { userId } = params;

  const data = await db
    .select()
    .from(categoryBudgets)
    .where(eq(categoryBudgets.userId, userId))
    .orderBy(desc(categoryBudgets.activeFrom))
    .limit(1);

  return data;
}

export async function getSpendingByCategoryTypeQuery({
  from,
  to,
  type,
  userId,
}: {
  from: Date;
  to: Date;
  type: CategoryType;
  userId: string;
}) {
  const data = await db.transaction(async (tx) => {
    const actual = await tx
      .select({
        actual:
          sql<number>`SUM(CASE WHEN ${categories.type} = ${type.toUpperCase()} THEN ${bankTransactions.amount} ELSE 0 END)`.as(
            "actual",
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
          gt(bankTransactions.date, from),
          lt(bankTransactions.date, to),
        ),
      );

    const cats = await tx.query.categories.findMany({
      columns: {},
      where: and(eq(categories.type, type), eq(categories.userId, userId)),
      with: {
        budgets: {
          columns: {
            budget: true,
          },
          where: lt(categoryBudgets.activeFrom, to),
          orderBy: desc(categoryBudgets.activeFrom),
          limit: 1,
        },
      },
    });

    return {
      actual: actual[0]?.actual ?? 0,
      budget: cats
        .flatMap((c) => c.budgets.map((b) => b.budget))
        .reduce((acc, value) => (acc += +value), 0),
    };
  });

  return data;
}
