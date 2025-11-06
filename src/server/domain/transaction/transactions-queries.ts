import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  lte,
  not,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import type { DBClient } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import {
  tag_table,
  transaction_attachment_table,
  transaction_category_table,
  transaction_split_table,
  transaction_table,
  transaction_to_tag_table,
} from "~/server/db/schema/transactions";
import { buildSearchQuery } from "~/server/db/utils";
import type { TransactionFrequencyType } from "~/shared/constants/enum";

export type GetTransactionsParams = {
  // ownership
  organizationId: string;
  // pagination
  cursor?: string | null;
  sort?: string[] | null;
  pageSize?: number;
  // filters
  q?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
  accounts?: string[] | null;
  type?: "income" | "expense" | null;
  start?: string | null;
  end?: string | null;
  recurring?: string[] | null;
  amountRange?: number[] | null;
  amount?: string[] | null;
  manual?: "include" | "exclude" | null;
  reporting?: "include" | "exclude" | null;
};

export async function getTransactionsQuery(
  db: DBClient,
  params: GetTransactionsParams,
) {
  // Always limit by organizationId
  const {
    organizationId,
    sort,
    cursor,
    pageSize = 40,
    q,
    categories: filterCategories,
    tags: filterTags,
    accounts: filterAccounts,
    start,
    end,
    recurring: filterRecurring,
    amount: filterAmount,
    amountRange: filterAmountRange,
    type,
    reporting: filterReporting,
    manual: filterManual,
  } = params;

  // Always start with orgId filter
  const whereConditions: (SQL | undefined)[] = [
    eq(transaction_table.organizationId, organizationId),
  ];

  // Date range filter
  if (start) {
    const startDate = new Date(start);
    whereConditions.push(gte(transaction_table.date, startDate.toISOString()));
  }
  if (end) {
    const endDate = new Date(end);
    whereConditions.push(lte(transaction_table.date, endDate.toISOString()));
  }

  // Search query filter (name, description, or amount)
  if (q) {
    const numericQ = Number.parseFloat(q);
    if (!Number.isNaN(numericQ)) {
      whereConditions.push(sql`${transaction_table.amount} = ${numericQ}`);
    } else {
      const searchQuery = buildSearchQuery(q);
      const ftsCondition = sql`to_tsquery('english', ${searchQuery}) @@ ${transaction_table.ftsVector}`;
      const nameCondition = sql`${transaction_table.name} ILIKE '%' || ${q} || '%'`;
      const descriptionCondition = sql`${transaction_table.description} ILIKE '%' || ${q} || '%'`;
      whereConditions.push(
        or(ftsCondition, nameCondition, descriptionCondition),
      );
    }
  }

  // Reports filtering
  if (filterReporting === "exclude") {
    whereConditions.push(
      or(
        eq(transaction_table.internal, true),
        eq(transaction_category_table.excluded, true),
      ),
    );
  } else if (filterReporting === "include") {
    whereConditions.push(
      eq(transaction_table.internal, false),
      eq(transaction_category_table.excluded, false),
    );
  }

  // Categories filter
  if (filterCategories && filterCategories.length > 0) {
    const categoryConditions: (SQL | undefined)[] = [];
    for (const categorySlug of filterCategories) {
      categoryConditions.push(
        eq(transaction_category_table.slug, categorySlug),
      );
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
          // eq(transactionTags.organizationId, orgId), // Ensure transactionTags are for the correct user
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
      ) as TransactionFrequencyType[];
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
  } else if (type === "income") {
    whereConditions.push(gt(transaction_table.amount, 0));
  }

  // Accounts filter
  if (filterAccounts && filterAccounts.length > 0) {
    whereConditions.push(
      and(
        inArray(transaction_table.accountId, filterAccounts),
        sql`EXISTS (SELECT 1 FROM ${account_table} WHERE ${eq(account_table.id, transaction_table.accountId)} AND ${eq(account_table.organizationId, organizationId)})`,
      ),
    );
  }

  console.log(filterAmount, filterAmountRange);

  // Amount range filter
  if (
    filterAmountRange &&
    filterAmountRange.length === 2 &&
    typeof filterAmountRange[0] === "number" &&
    typeof filterAmountRange[1] === "number"
  ) {
    whereConditions.push(gte(transaction_table.amount, filterAmountRange[0]));
    whereConditions.push(lte(transaction_table.amount, filterAmountRange[1]));
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

  // Manual filter
  if (filterManual === "include") {
    whereConditions.push(not(eq(transaction_table.source, "api")));
  } else if (filterManual === "exclude") {
    whereConditions.push(eq(transaction_table.source, "api"));
  }

  const finalWhereConditions = whereConditions.filter((c) => c !== undefined);

  // All joins must also be limited by organizationId where relevant
  const queryBuilder = db
    .select({
      id: transaction_table.id,
      date: transaction_table.date,
      amount: transaction_table.amount,
      currency: transaction_table.currency,
      status: transaction_table.status,
      note: transaction_table.note,
      internal: transaction_table.internal,
      source: transaction_table.source,
      recurring: transaction_table.recurring,
      counterpartyName: transaction_table.counterpartyName,
      frequency: transaction_table.frequency,
      name: transaction_table.name,
      description: transaction_table.description,
      enrichmentCompleted: transaction_table.enrichmentCompleted,
      createdAt: transaction_table.createdAt,
      attachments: sql<
        Array<{
          id: string;
          filename: string | null;
          path: string | null;
          type: string;
          size: number;
        }>
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${transaction_attachment_table.id}, 'filename', ${transaction_attachment_table.name}, 'path', ${transaction_attachment_table.path}, 'type', ${transaction_attachment_table.type}, 'size', ${transaction_attachment_table.size})) FILTER (WHERE ${transaction_attachment_table.id} IS NOT NULL), '[]'::json)`.as(
        "attachments",
      ),
      category: {
        id: transaction_category_table.id,
        slug: transaction_category_table.slug,
        name: transaction_category_table.name,
        color: transaction_category_table.color,
        icon: transaction_category_table.icon,
        excluded: transaction_category_table.excluded,
      },
      account: {
        id: account_table.id,
        name: account_table.name,
        currency: account_table.currency,
        logoUrl: account_table.logoUrl,
      },
      tags: sql<
        Array<{ id: string; name: string | null }>
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${tag_table.id}, 'name', ${tag_table.name})) FILTER (WHERE ${tag_table.id} IS NOT NULL), '[]'::json)`.as(
        "tags",
      ),
      splits: sql<
        Array<{
          id: string;
          note: string | null;
          categorySlug: string | null;
          amount: number;
        }>
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${transaction_split_table.id}, 'categorySlug', ${transaction_split_table.categorySlug}, 'note', ${transaction_split_table.note}, 'amount', ${transaction_split_table.amount})) FILTER (WHERE ${transaction_split_table.id} IS NOT NULL), '[]'::json)`.as(
        "tags",
      ),
    })
    .from(transaction_table)
    .leftJoin(
      transaction_category_table,
      and(
        eq(transaction_table.categorySlug, transaction_category_table.slug),
        eq(transaction_category_table.organizationId, organizationId),
      ),
    )
    .leftJoin(
      account_table,
      and(
        eq(transaction_table.accountId, account_table.id),
        eq(account_table.organizationId, organizationId),
      ),
    )
    .leftJoin(
      transaction_to_tag_table,
      and(eq(transaction_to_tag_table.transactionId, transaction_table.id)),
    )
    .leftJoin(
      tag_table,
      and(
        eq(tag_table.id, transaction_to_tag_table.tagId),
        eq(tag_table.organizationId, organizationId),
      ),
    )
    .leftJoin(
      transaction_split_table,
      and(eq(transaction_split_table.transactionId, transaction_table.id)),
    )
    .leftJoin(
      transaction_attachment_table,
      and(
        eq(transaction_attachment_table.transactionId, transaction_table.id),
        eq(transaction_attachment_table.organizationId, organizationId),
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
      transaction_table.source,
      transaction_table.recurring,
      transaction_table.frequency,
      transaction_table.name,
      transaction_table.description,
      transaction_table.createdAt,
      transaction_category_table.id,
      transaction_category_table.name,
      transaction_category_table.color,
      transaction_category_table.slug,
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
          sql`(EXISTS (SELECT 1 FROM ${transaction_attachment_table} WHERE ${eq(transaction_attachment_table.transactionId, transaction_table.id)} AND ${eq(transaction_attachment_table.organizationId, organizationId)}) OR ${transaction_table.status} = 'completed')`,
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
        order(transaction_category_table.name),
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
