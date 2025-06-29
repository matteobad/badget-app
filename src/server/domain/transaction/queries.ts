"server-only";

import type { transactionFrequencyEnum } from "~/server/db/schema/transactions";
import type { getTransactionsSchema } from "~/shared/validators/transaction.schema";
import type { SQL } from "drizzle-orm";
import type z from "zod/v4";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { category_table } from "~/server/db/schema/categories";
import { connection_table } from "~/server/db/schema/open-banking";
import {
  attachment_table,
  tag_table,
  transaction_table,
  transaction_to_tag_table,
} from "~/server/db/schema/transactions";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lt,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";

// Helper type from schema if not already exported
type TransactionFrequency =
  (typeof transactionFrequencyEnum.enumValues)[number];

export async function getTransactionsQuery(
  params: z.infer<typeof getTransactionsSchema>,
  userId: string,
) {
  // Always limit by teamId
  const {
    sort,
    cursor,
    pageSize = 40,
    q,
    statuses,
    attachments,
    categories: filterCategories,
    tags: filterTags,
    type,
    accounts: filterAccounts,
    start,
    end,
    recurring: filterRecurring,
    amount: filterAmount,
    amountRange: filterAmountRange,
  } = params;

  // Always start with userId filter
  const whereConditions: (SQL | undefined)[] = [
    eq(transaction_table.userId, userId),
  ];

  // Date range filter
  if (start) {
    const startDate = new Date(start);
    whereConditions.push(gte(transaction_table.date, startDate));
  }
  if (end) {
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1);
    whereConditions.push(lte(transaction_table.date, endDate));
  }

  // Search query filter (name, description, or amount)
  if (q) {
    const numericQ = Number.parseFloat(q);
    if (!Number.isNaN(numericQ)) {
      whereConditions.push(sql`${transaction_table.amount} = ${numericQ}`);
    } else {
      const descriptionCondition = sql`${transaction_table.description} ILIKE '%' || ${q} || '%'`;
      whereConditions.push(or(descriptionCondition));
    }
  }

  // Status filtering - simplified logic using direct EXISTS subqueries
  if (statuses?.includes("uncompleted") || attachments === "exclude") {
    // Transaction is NOT fulfilled (no attachments AND status is not completed) AND status is not excluded
    whereConditions.push(
      sql`NOT (EXISTS (SELECT 1 FROM ${attachment_table} WHERE ${eq(attachment_table.transactionId, transaction_table.id)} AND ${eq(attachment_table.userId, userId)}) OR ${transaction_table.status} = 'completed') AND ${transaction_table.status} != 'excluded'`,
    );
  } else if (statuses?.includes("completed") || attachments === "include") {
    // Transaction is fulfilled (has attachments OR status is completed)
    whereConditions.push(
      sql`(EXISTS (SELECT 1 FROM ${attachment_table} WHERE ${eq(attachment_table.transactionId, transaction_table.id)} AND ${eq(attachment_table.userId, userId)}) OR ${transaction_table.status} = 'completed')`,
    );
  } else if (statuses?.includes("excluded")) {
    whereConditions.push(eq(transaction_table.status, "excluded"));
  } else if (statuses?.includes("archived")) {
    whereConditions.push(eq(transaction_table.status, "archived"));
  } else {
    // Default: pending, posted, or completed
    whereConditions.push(
      inArray(transaction_table.status, ["pending", "posted", "completed"]),
    );
  }

  // Categories filter
  if (filterCategories && filterCategories.length > 0) {
    const categoryConditions: (SQL | undefined)[] = [];
    for (const categorySlug of filterCategories) {
      if (categorySlug === "uncategorized") {
        categoryConditions.push(isNull(transaction_table.categorySlug));
      } else {
        categoryConditions.push(
          eq(transaction_table.categorySlug, categorySlug),
        );
      }
    }
    const definedCategoryConditions = categoryConditions.filter(
      (c) => c !== undefined,
    );
    if (definedCategoryConditions.length > 0) {
      whereConditions.push(or(...definedCategoryConditions));
    }
  }

  // Tags filter using EXISTS
  if (filterTags && filterTags.length > 0) {
    const tagsExistSubquery = db
      .select({ val: sql`1` })
      .from(transaction_to_tag_table)
      .innerJoin(tag_table, eq(transaction_to_tag_table.tagId, tag_table.id))
      .where(
        and(
          eq(transaction_to_tag_table.transactionId, transaction_table.id), // Correlate with the outer transaction
          inArray(tag_table.id, filterTags), // Filter by the provided tag IDs
        ),
      );
    whereConditions.push(sql`EXISTS (${tagsExistSubquery})`);
  }

  // Recurring filter
  if (filterRecurring && filterRecurring.length > 0) {
    if (filterRecurring.includes("all")) {
      whereConditions.push(eq(transaction_table.recurring, true));
    } else {
      const validFrequencies = filterRecurring.filter(
        (f) => f !== "all",
      ) as TransactionFrequency[];
      if (validFrequencies.length > 0) {
        whereConditions.push(
          inArray(transaction_table.frequency, validFrequencies),
        );
      }
    }
  }

  // Type filter (expense/income)
  if (type === "expense") {
    whereConditions.push(lt(transaction_table.amount, 0));
    whereConditions.push(ne(transaction_table.categorySlug, "transfer"));
  } else if (type === "income") {
    whereConditions.push(eq(transaction_table.categorySlug, "income"));
  }

  // Accounts filter
  if (filterAccounts && filterAccounts.length > 0) {
    whereConditions.push(
      and(
        inArray(transaction_table.accountId, filterAccounts),
        sql`EXISTS (SELECT 1 FROM ${account_table} WHERE ${eq(account_table.id, transaction_table.accountId)} AND ${eq(account_table.userId, userId)})`,
      ),
    );
  }

  // Amount range filter
  if (
    filterAmountRange &&
    filterAmountRange.length === 2 &&
    typeof filterAmountRange[0] === "number" &&
    typeof filterAmountRange[1] === "number"
  ) {
    whereConditions.push(
      gte(transaction_table.amount, Number(filterAmountRange[0])),
    );
    whereConditions.push(
      lte(transaction_table.amount, Number(filterAmountRange[1])),
    );
  }

  // Specific amount filter (gte/lte)
  if (filterAmount && filterAmount.length === 2) {
    const [operator, value] = filterAmount;
    if (operator === "gte") {
      whereConditions.push(gte(transaction_table.amount, Number(value)));
    } else if (operator === "lte") {
      whereConditions.push(lte(transaction_table.amount, Number(value)));
    }
  }

  const finalWhereConditions = whereConditions.filter((c) => c !== undefined);

  // All joins must also be limited by teamId where relevant
  const queryBuilder = db
    .select({
      id: transaction_table.id,
      date: transaction_table.date,
      amount: transaction_table.amount,
      currency: transaction_table.currency,
      status: transaction_table.status,
      note: transaction_table.note,
      manual: transaction_table.manual,
      recurring: transaction_table.recurring,
      counterpartyName: transaction_table.counterpartyName,
      frequency: transaction_table.frequency,
      description: transaction_table.description,
      createdAt: transaction_table.createdAt,
      isFulfilled:
        sql<boolean>`(EXISTS (SELECT 1 FROM ${attachment_table} WHERE ${eq(attachment_table.transactionId, transaction_table.id)} AND ${eq(attachment_table.userId, userId)}) OR ${transaction_table.status} = 'completed')`.as(
          "isFulfilled",
        ),
      attachments: sql<
        Array<{
          id: string;
          filename: string | null;
          path: string | null;
          type: string;
          size: number;
        }>
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${attachment_table.id}, 'filename', ${attachment_table.fileName}, 'path', ${attachment_table.fileUrl}, 'type', ${attachment_table.fileType}, 'size', ${attachment_table.fileSize})) FILTER (WHERE ${attachment_table.id} IS NOT NULL), '[]'::json)`.as(
        "attachments",
      ),
      category: {
        id: category_table.id,
        slug: category_table.slug,
        name: category_table.name,
        color: category_table.color,
        icon: category_table.icon,
      },
      account: {
        id: account_table.id,
        name: account_table.name,
        currency: account_table.currency,
        logoUrl: account_table.logoUrl,
      },
      // connection: {
      //   id: institution_table.id,
      //   name: connection_table.name,
      //   logoUrl: connection_table.logoUrl,
      // },
      tags: sql<
        Array<{ id: string; name: string | null }>
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${tag_table.id}, 'text', ${tag_table.text})) FILTER (WHERE ${tag_table.id} IS NOT NULL), '[]'::json)`.as(
        "tags",
      ),
    })
    .from(transaction_table)
    .leftJoin(
      category_table,
      and(
        eq(transaction_table.categoryId, category_table.id),
        eq(category_table.userId, userId),
      ),
    )
    .leftJoin(
      account_table,
      and(
        eq(transaction_table.accountId, account_table.id),
        eq(account_table.userId, userId),
      ),
    )
    .leftJoin(
      connection_table,
      eq(account_table.connectionId, connection_table.id),
    )
    .leftJoin(
      transaction_to_tag_table,
      and(eq(transaction_to_tag_table.transactionId, transaction_table.id)),
    )
    .leftJoin(
      tag_table,
      and(
        eq(tag_table.id, transaction_to_tag_table.tagId),
        eq(tag_table.userId, userId),
      ),
    )
    .leftJoin(
      attachment_table,
      and(
        eq(attachment_table.transactionId, transaction_table.id),
        eq(attachment_table.userId, userId),
      ),
    )
    .where(and(...finalWhereConditions))
    .groupBy(
      transaction_table.id,
      transaction_table.date,
      transaction_table.amount,
      transaction_table.currency,
      transaction_table.status,
      transaction_table.note,
      transaction_table.manual,
      transaction_table.recurring,
      transaction_table.frequency,
      transaction_table.description,
      transaction_table.createdAt,
      category_table.id,
      category_table.name,
      category_table.color,
      category_table.slug,
      account_table.id,
      account_table.name,
      account_table.currency,
      account_table.logoUrl,
    );

  let query = queryBuilder.$dynamic();

  // Sorting
  if (sort && sort.length === 2) {
    const [column, direction] = sort;
    const isAscending = direction === "asc";
    const order = isAscending ? asc : desc;

    if (column === "attachment") {
      query = query.orderBy(
        order(
          sql`(EXISTS (SELECT 1 FROM ${attachment_table} WHERE ${eq(attachment_table.transactionId, transaction_table.id)} AND ${eq(attachment_table.userId, userId)}) OR ${transaction_table.status} = 'completed')`,
        ),
        order(transaction_table.id),
      );
    } else if (column === "bank_account") {
      query = query.orderBy(
        order(account_table.name),
        order(transaction_table.id),
      );
    } else if (column === "category") {
      query = query.orderBy(
        order(category_table.name),
        order(transaction_table.id),
      );
    } else if (column === "tags") {
      query = query.orderBy(
        order(
          sql`EXISTS (SELECT 1 FROM ${transaction_to_tag_table} WHERE ${eq(transaction_to_tag_table.transactionId, transaction_table.id)})`,
        ),
        order(transaction_table.id),
      );
    } else if (column === "date") {
      query = query.orderBy(
        order(transaction_table.date),
        order(transaction_table.id),
      );
    } else if (column === "amount") {
      query = query.orderBy(
        order(transaction_table.amount),
        order(transaction_table.id),
      );
    } else if (column === "status") {
      query = query.orderBy(
        order(transaction_table.status),
        order(transaction_table.id),
      );
    } else if (column === "counterparty") {
      query = query.orderBy(
        order(transaction_table.counterpartyName),
        order(transaction_table.id),
      );
    } else {
      query = query.orderBy(
        desc(transaction_table.date),
        desc(transaction_table.id),
      );
    }
  } else {
    query = query.orderBy(
      desc(transaction_table.date),
      desc(transaction_table.id),
    );
  }

  const offset = cursor ? Number.parseInt(cursor, 10) : 0;
  const finalQuery = query.limit(pageSize).offset(offset);

  const fetchedData = await finalQuery;

  const hasNextPage = fetchedData.length === pageSize;
  const nextCursor = hasNextPage ? (offset + pageSize).toString() : undefined;

  const processedData = fetchedData.map((row) => {
    const { account, ...rest } = row;

    const newAccount = {
      ...account,
    };

    return {
      ...rest,
      account: newAccount,
    };
  });

  return {
    meta: {
      cursor: nextCursor,
      hasPreviousPage: offset > 0,
      hasNextPage: hasNextPage,
    },
    data: processedData,
  };
}

export async function getTransactionByIdQuery(id: string, _userId: string) {
  const result = await db
    .select()
    .from(transaction_table)
    .where(
      and(
        eq(transaction_table.id, id),
        // eq(category_table.userId, params.userId),
      ),
    );

  return result[0];
}

export async function getTransactionAmountRangeQuery(userId: string) {
  return await db
    .select({
      amount: transaction_table.amount,
    })
    .from(transaction_table)
    .where(eq(transaction_table.userId, userId));
}
