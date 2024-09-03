import type { SQL } from "drizzle-orm";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  lt,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { type z } from "zod";

import { filterColumn } from "~/lib/utils";
import {
  type institutionsSearchParamsSchema,
  type transactionsSearchParamsSchema,
} from "~/lib/validators";
import { db, schema } from "..";
import { category, categoryBudgets } from "../schema/categories";
import { CategoryType } from "../schema/enum";
import { bankAccounts, bankTransactions } from "../schema/open-banking";
import { type DrizzleWhere } from "../utils";

export async function getFilteredInstitutionsQuery({
  params,
}: {
  params: z.infer<typeof institutionsSearchParamsSchema>;
}) {
  try {
    let query = db.select().from(schema.institutions).$dynamic();
    console.log(params.q);

    if (params.q) {
      query = query.where(
        ilike(schema.institutions.name, "%" + params.q + "%"),
      );
    }

    return await query;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return [];
  }
}

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
      schema.category,
      eq(schema.bankTransactions.categoryId, schema.category.id),
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
        icon: item.category?.icon,
        color: item.category?.color,
        name: item.category?.name,
        type: item.category?.type,
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
  const {
    page,
    per_page,
    sort,
    description,
    operator,
    from,
    to,
    category,
    account,
  } = params;

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
    userId
      ? filterColumn({
          column: bankTransactions.userId,
          value: userId,
          isSelectable: true,
        })
      : undefined,
    description
      ? filterColumn({
          column: bankTransactions.description,
          value: description,
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
      .leftJoin(
        schema.category,
        eq(schema.category.id, bankTransactions.categoryId),
      )
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
            icon: item.category?.icon,
            color: item.category?.color,
            name: item.category?.name,
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

  const data = await db.query.category.findMany({
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
    where: eq(schema.category.userId, userId),
    orderBy: desc(schema.category.manual),
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

export async function getCategoryRulesQuery(params: GetCategoriesParams) {
  const { userId } = params;

  const data = await db.query.category.findMany({
    columns: {
      id: true,
      name: true,
    },
    with: {
      rules: {
        columns: {},
        with: { tokens: true },
      },
    },
    where: eq(schema.category.userId, userId),
  });

  const result = data.map(({ id, name, rules }) => ({
    id: id,
    name: name,
    keywords: rules.reduce((acc, rule) => {
      for (const { token, relevance } of rule.tokens) {
        acc.set(token, relevance);
      }
      return acc;
    }, new Map<string, number>()),
  }));

  return result;
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
          sql<number>`SUM(CASE WHEN ${schema.category.type} = ${type.toUpperCase()} THEN ${bankTransactions.amount} ELSE 0 END)`.as(
            "actual",
          ),
      })
      .from(bankTransactions)
      .innerJoin(
        schema.category,
        eq(bankTransactions.categoryId, schema.category.id),
      )
      .where(
        and(
          eq(bankTransactions.userId, userId),
          gt(bankTransactions.date, from),
          lt(bankTransactions.date, to),
        ),
      );

    const cats = await tx.query.category.findMany({
      columns: {},
      where: and(
        eq(schema.category.type, type),
        eq(schema.category.userId, userId),
      ),
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

export async function getSpendingByCategoryQuery({
  from,
  to,
  userId,
}: {
  from: Date;
  to: Date;
  userId: string;
}) {
  const data = await db.transaction(async (tx) => {
    const actuals = await tx
      .select({
        categoryId: bankTransactions.categoryId,
        actual: sql<number>`sum(${bankTransactions.amount})`.as("actual"),
      })
      .from(bankTransactions)
      .where(
        and(
          eq(bankTransactions.userId, userId),
          gt(bankTransactions.date, from),
          lt(bankTransactions.date, to),
        ),
      )
      .groupBy((schema) => schema.categoryId);

    const budgets = await tx.query.category.findMany({
      where: and(
        eq(category.userId, userId),
        ne(category.type, CategoryType.TRANSFER),
      ),
      with: {
        budgets: {
          columns: {
            budget: true,
            categoryId: true,
          },
          where: lt(categoryBudgets.activeFrom, to),
          orderBy: desc(categoryBudgets.activeFrom),
          limit: 1,
        },
      },
    });

    return budgets.map((categoryBudget) => {
      const { budgets, ...category } = categoryBudget;
      return {
        category: category.name,
        actual: Math.abs(
          Number(
            actuals.find((a) => a.categoryId === category.id)?.actual ?? 0,
          ),
        ),
        budget: Math.abs(
          Number(
            budgets.find((b) => b.categoryId === category.id)?.budget ?? 0,
          ),
        ),
      };
    });
  });

  return data;
}
