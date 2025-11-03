"server-only";

import { eachMonthOfInterval, format } from "date-fns";
import type { SQL } from "drizzle-orm";
import {
  and,
  asc,
  cosineDistance,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
import type z from "zod";
import type { DBClient } from "~/server/db";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { connection_table } from "~/server/db/schema/open-banking";
import {
  tag_table,
  transaction_attachment_table,
  transaction_category_table,
  transaction_embeddings_table,
  transaction_split_table,
  transaction_table,
  transaction_to_tag_table,
} from "~/server/db/schema/transactions";
import { buildSearchQuery } from "~/server/db/utils";
import type { TransactionFrequencyType } from "~/shared/constants/enum";
import type { getTransactionTagsSchema } from "~/shared/validators/tag.schema";
import type { getTransactionsSchema } from "~/shared/validators/transaction.schema";

export async function getTransactionsQuery(
  params: z.infer<typeof getTransactionsSchema>,
  orgId: string,
) {
  // Always limit by organizationId
  const {
    sort,
    cursor,
    pageSize = 40,
    q,
    statuses,
    attachments,
    categories: filterCategories,
    tags: filterTags,
    accounts: filterAccounts,
    start,
    end,
    recurring: filterRecurring,
    amount: filterAmount,
    amount_range: filterAmountRange,
    type,
    reports,
  } = params;

  // Always start with orgId filter
  const whereConditions: (SQL | undefined)[] = [
    eq(transaction_table.organizationId, orgId),
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

  // Status filtering - simplified logic using direct EXISTS subqueries
  if (statuses?.includes("uncompleted") || attachments === "exclude") {
    // Transaction is NOT fulfilled (no attachments AND status is not completed) AND status is not excluded
    whereConditions.push(
      sql`NOT (EXISTS (SELECT 1 FROM ${transaction_attachment_table} WHERE ${eq(transaction_attachment_table.transactionId, transaction_table.id)} AND ${eq(transaction_attachment_table.organizationId, orgId)}) OR ${transaction_table.status} = 'completed') AND ${transaction_table.status} != 'excluded'`,
    );
  } else if (statuses?.includes("completed") || attachments === "include") {
    // Transaction is fulfilled (has attachments OR status is completed)
    whereConditions.push(
      sql`(EXISTS (SELECT 1 FROM ${transaction_attachment_table} WHERE ${eq(transaction_attachment_table.transactionId, transaction_table.id)} AND ${eq(transaction_attachment_table.organizationId, orgId)}) OR ${transaction_table.status} = 'completed')`,
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

  // Reports filtering
  if (reports === "excluded") {
    whereConditions.push(
      or(
        eq(transaction_table.internal, true),
        eq(transaction_category_table.excluded, true),
      ),
    );
  }
  if (reports === "included") {
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
    // whereConditions.push(ne(transactions.categorySlug, "transfer"));
  } else if (type === "income") {
    whereConditions.push(gt(transaction_table.amount, 0));
  }

  // Accounts filter
  if (filterAccounts && filterAccounts.length > 0) {
    whereConditions.push(
      and(
        inArray(transaction_table.accountId, filterAccounts),
        sql`EXISTS (SELECT 1 FROM ${account_table} WHERE ${eq(account_table.id, transaction_table.accountId)} AND ${eq(account_table.organizationId, orgId)})`,
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
        eq(transaction_category_table.organizationId, orgId),
      ),
    )
    .leftJoin(
      account_table,
      and(
        eq(transaction_table.accountId, account_table.id),
        eq(account_table.organizationId, orgId),
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
        eq(tag_table.organizationId, orgId),
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
        eq(transaction_attachment_table.organizationId, orgId),
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
          sql`(EXISTS (SELECT 1 FROM ${transaction_attachment_table} WHERE ${eq(transaction_attachment_table.transactionId, transaction_table.id)} AND ${eq(transaction_attachment_table.organizationId, orgId)}) OR ${transaction_table.status} = 'completed')`,
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

export async function getTransactionByIdQuery(id: string, orgId: string) {
  const result = await db
    .select({
      id: transaction_table.id,
      date: transaction_table.date,
      amount: transaction_table.amount,
      currency: transaction_table.currency,
      status: transaction_table.status,
      note: transaction_table.note,
      source: transaction_table.source,
      internal: transaction_table.internal,
      recurring: transaction_table.recurring,
      counterpartyName: transaction_table.counterpartyName,
      frequency: transaction_table.frequency,
      name: transaction_table.name,
      description: transaction_table.description,
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
        Array<{ id: string; name: string }>
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${tag_table.id}, 'name', ${tag_table.name})) FILTER (WHERE ${tag_table.id} IS NOT NULL), '[]'::json)`.as(
        "tags",
      ),
    })
    .from(transaction_table)
    .leftJoin(
      transaction_category_table,
      and(
        eq(transaction_table.categorySlug, transaction_category_table.slug),
        eq(transaction_category_table.organizationId, orgId),
      ),
    )
    .leftJoin(
      account_table,
      and(
        eq(transaction_table.accountId, account_table.id),
        eq(account_table.organizationId, orgId),
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
        eq(tag_table.organizationId, orgId),
      ),
    )
    .leftJoin(
      transaction_attachment_table,
      and(
        eq(transaction_attachment_table.transactionId, transaction_table.id),
        eq(transaction_attachment_table.organizationId, orgId),
      ),
    )
    .where(
      and(
        eq(transaction_table.id, id),
        eq(transaction_table.organizationId, orgId),
      ),
    )
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

  return result[0];
}

export async function getTransactionTagsQuery(
  params: z.infer<typeof getTransactionTagsSchema>,
  _orgId: string,
) {
  return await db
    .select({
      id: transaction_to_tag_table.tagId,
      name: tag_table.name,
    })
    .from(transaction_to_tag_table)
    .innerJoin(tag_table, eq(transaction_to_tag_table.tagId, tag_table.id))
    .where(eq(transaction_to_tag_table.transactionId, params.transactionId));
}

export async function getTransactionAmountRangeQuery(orgId: string) {
  return await db
    .select({
      amount: transaction_table.amount,
    })
    .from(transaction_table)
    .where(eq(transaction_table.organizationId, orgId));
}

export async function getTransactionCategoryCountsQuery(orgId: string) {
  try {
    return await db
      .select({
        categorySlug: transaction_table.categorySlug,
        count: count(),
      })
      .from(transaction_table)
      .where(eq(transaction_table.organizationId, orgId))
      .groupBy(transaction_table.categorySlug)
      .having(gt(count(), 0))
      .then((res) =>
        res.reduce(
          (acc, { categorySlug, count }) => {
            acc[categorySlug ?? "null"] = count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      );
  } catch (err) {
    console.error(err);
    return {} as Record<string, number>;
  }
}

export async function getTransactionAccountCountsQuery(orgId: string) {
  try {
    return await db
      .select({
        accountId: transaction_table.accountId,
        count: count(),
      })
      .from(transaction_table)
      .where(eq(transaction_table.organizationId, orgId))
      .groupBy(transaction_table.accountId)
      .having(gt(count(), 0))
      .then((res) =>
        res.reduce(
          (acc, { accountId, count }) => {
            acc[accountId] = count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      );
  } catch (err) {
    console.error(err);
    return {} as Record<string, number>;
  }
}

export async function getTransactionTagCountsQuery(orgId: string) {
  try {
    return await db
      .select({
        tagId: transaction_to_tag_table.tagId,
        count: count(),
      })
      .from(transaction_table)
      .leftJoin(
        transaction_to_tag_table,
        eq(transaction_to_tag_table.transactionId, transaction_table.id),
      )
      .where(eq(transaction_table.organizationId, orgId))
      .groupBy(transaction_to_tag_table.tagId)
      .having(gt(count(), 0))
      .then((res) =>
        res.reduce(
          (acc, { tagId, count }) => {
            acc[tagId ?? "null"] = count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      );
  } catch (err) {
    console.error(err);
    return {} as Record<string, number>;
  }
}

type GetSimilarTransactionsParams = {
  name: string;
  organizationId: string;
  categorySlug?: string;
  frequency?: TransactionFrequencyType;
  transactionId?: string; // Optional: if we want to exclude the source transaction
  limit?: number;
  minSimilarityScore?: number; // Alternative to limit: quality-based filtering
};

/**
 * Find similar transactions using hybrid search: combines embeddings AND FTS for comprehensive results
 *
 * @param db - Database connection
 * @param params - Search parameters including optional embedding settings
 * @returns Array of similar transactions, ordered by relevance (embedding matches first, then FTS matches)
 */
export async function getSimilarTransactions(
  db: DBClient,
  params: GetSimilarTransactionsParams,
) {
  const {
    name,
    organizationId,
    categorySlug,
    frequency,
    transactionId,
    minSimilarityScore = 0.9,
  } = params;

  console.info({
    msg: "Starting hybrid search for similar transactions",
    name,
    organizationId,
    minSimilarityScore,
    transactionId,
    categorySlug,
    frequency,
  });

  let embeddingResults: {
    id: string;
    amount: number;
    organizationId: string;
    name: string;
    date: string;
    categorySlug: string | null;
    frequency: TransactionFrequencyType | null;
    similarity: number;
    source: string;
  }[] = [];
  let ftsResults: {
    id: string;
    amount: number;
    organizationId: string;
    name: string;
    date: string;
    categorySlug: string | null;
    frequency: TransactionFrequencyType | null;
    source: string;
  }[] = [];
  let embeddingSourceText: string | null = null;

  // 1. EMBEDDING SEARCH (if transactionId provided)
  if (transactionId) {
    console.info("Attempting embedding search", {
      transactionId,
      organizationId,
    });

    try {
      const sourceEmbedding = await db
        .select({
          embedding: transaction_embeddings_table.embedding,
          sourceText: transaction_embeddings_table.sourceText,
        })
        .from(transaction_embeddings_table)
        .where(
          and(
            eq(transaction_embeddings_table.transactionId, transactionId),
            eq(transaction_embeddings_table.organizationId, organizationId),
          ),
        )
        .limit(1);

      if (sourceEmbedding.length > 0 && sourceEmbedding[0]!.embedding) {
        const sourceEmbeddingVector = sourceEmbedding[0]!.embedding;
        const sourceText = sourceEmbedding[0]!.sourceText;
        embeddingSourceText = sourceText; // Store for FTS search

        console.info("✅ Found embedding for transaction", {
          transactionId,
          sourceText,
          embeddingExists: true,
        });

        // Calculate similarity using cosineDistance function from Drizzle
        const similarity = sql<number>`1 - (${cosineDistance(transaction_embeddings_table.embedding, sourceEmbeddingVector)})`;

        const embeddingConditions: (SQL | undefined)[] = [
          eq(transaction_table.organizationId, organizationId),
          ne(transaction_table.id, transactionId), // Exclude the source transaction
          gt(similarity, minSimilarityScore), // Use configurable similarity threshold
        ];

        if (categorySlug) {
          embeddingConditions.push(
            or(
              isNull(transaction_table.categorySlug),
              ne(transaction_table.categorySlug, categorySlug),
            ),
          );
        }

        // Note: We don't filter by frequency here because we want to find similar transactions
        // regardless of their current frequency so we can update them to the new frequency

        const finalEmbeddingConditions = embeddingConditions.filter(
          (c) => c !== undefined,
        );

        embeddingResults = await db
          .select({
            id: transaction_table.id,
            amount: transaction_table.amount,
            organizationId: transaction_table.organizationId,
            name: transaction_table.name,
            date: transaction_table.date,
            categorySlug: transaction_table.categorySlug,
            frequency: transaction_table.frequency,
            similarity,
            source: sql<string>`'embedding'`.as("source"),
          })
          .from(transaction_table)
          .innerJoin(
            transaction_embeddings_table,
            eq(
              transaction_embeddings_table.transactionId,
              transaction_table.id,
            ),
          )
          .where(and(...finalEmbeddingConditions))
          .orderBy(desc(similarity)); // No limit - let similarity threshold determine results

        console.info("Embedding search completed", {
          resultsFound: embeddingResults.length,
          minSimilarityScore,
          transactionId,
        });
      } else {
        console.warn(
          "❌ No embedding found for transaction - will rely on FTS only",
          {
            transactionId,
            organizationId,
            transactionName: name,
          },
        );
      }
    } catch (error) {
      console.error("Embedding search failed", {
        error: error instanceof Error ? error.message : String(error),
        transactionId,
        organizationId,
      });
    }
  }

  // 2. FTS SEARCH (always run to complement embeddings)
  console.info("Running FTS search", {
    name,
    organizationId,
    hasEmbeddingResults: embeddingResults.length > 0,
    hasSourceEmbedding: !!embeddingSourceText,
  });

  const ftsConditions: (SQL | undefined)[] = [
    eq(transaction_table.organizationId, organizationId),
  ];

  if (transactionId) {
    ftsConditions.push(ne(transaction_table.id, transactionId));
  }

  // Always use the original transaction name for FTS search to ensure we find exact matches
  // The embedding source text might be different from the actual transaction names
  const searchTerm = name;
  const searchQuery = searchTerm
    .trim()
    .split(/\s+/)
    .map((term) => `${term.toLowerCase()}:*`)
    .join(" & ");
  ftsConditions.push(
    sql`to_tsquery('english', ${searchQuery}) @@ ${transaction_table.ftsVector}`,
  );

  console.info({
    msg: "FTS search using term",
    searchTerm,
    searchQuery,
    usingEmbeddingSourceText: false, // Always false now - we use original name
    originalName: name,
    embeddingSourceText: embeddingSourceText ?? "none",
    reason: "Using original transaction name to find exact matches",
  });

  if (categorySlug) {
    ftsConditions.push(
      or(
        isNull(transaction_table.categorySlug),
        ne(transaction_table.categorySlug, categorySlug),
      ),
    );
  }

  // Exclude transactions already found by embeddings
  if (embeddingResults.length > 0) {
    const embeddingIds = embeddingResults.map((r) => r.id);
    ftsConditions.push(
      sql`${transaction_table.id} NOT IN (${sql.join(
        embeddingIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    );
  }

  const finalFtsConditions = ftsConditions.filter((c) => c !== undefined);

  console.info({
    msg: "FTS search conditions",
    searchTerm,
    searchQuery,
    conditionsCount: finalFtsConditions.length,
    organizationId,
    transactionId,
    categorySlug,
    frequency,
  });

  ftsResults = await db
    .select({
      id: transaction_table.id,
      amount: transaction_table.amount,
      organizationId: transaction_table.organizationId,
      name: transaction_table.name,
      date: transaction_table.date,
      categorySlug: transaction_table.categorySlug,
      frequency: transaction_table.frequency,
      source: sql<string>`'fts'`.as("source"),
    })
    .from(transaction_table)
    .where(and(...finalFtsConditions)); // No limit - get all FTS matches

  console.info({
    msg: "FTS search completed",
    resultsFound: ftsResults.length,
    searchTerm,
    searchQuery,
    organizationId,
    sampleResults: ftsResults.slice(0, 3).map((r) => ({
      name: r.name,
      id: r.id,
    })),
  });

  // 3. COMBINE AND DEDUPLICATE RESULTS
  const allResults = [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...embeddingResults.map(({ similarity, source, ...rest }) => ({
      ...rest,
      matchType: source,
    })),
    ...ftsResults.map(({ source, ...rest }) => ({
      ...rest,
      matchType: source,
    })),
  ];

  // Remove duplicates based on transaction ID (most accurate)
  // If same ID appears in both embedding and FTS results, prioritize embedding
  const uniqueResults = allResults.filter((transaction, index, array) => {
    return index === array.findIndex((t) => t.id === transaction.id);
  });

  // Log final results with structured data
  console.info("Hybrid search completed", {
    totalResults: allResults.length,
    uniqueResults: uniqueResults.length,
    embeddingMatches: embeddingResults.length,
    ftsMatches: ftsResults.length,
    name,
    organizationId,
    minSimilarityScore,
    results: uniqueResults.map((t, i) => ({
      rank: i + 1,
      name: t.name,
      matchType: t.matchType,
      id: t.id,
    })),
  });

  // Remove matchType field and return all quality matches
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return uniqueResults.map(({ matchType, ...rest }) => rest);
}

export type GetTransactionsForEmbeddingParams = {
  transactionIds: string[];
  organizationId: string;
};

export type TransactionForEmbedding = {
  id: string;
  name: string;
  counterpartyName: string | null;
  description: string | null;
  merchantName: string | null;
};

export async function getTransactionsForEmbedding(
  db: DBClient,
  params: GetTransactionsForEmbeddingParams,
) {
  if (params.transactionIds.length === 0) {
    return [];
  }

  return db
    .select({
      id: transaction_table.id,
      name: transaction_table.name,
      counterpartyName: transaction_table.counterpartyName,
      description: transaction_table.description,
      merchantName: transaction_table.merchantName,
    })
    .from(transaction_table)
    .leftJoin(
      transaction_embeddings_table,
      eq(transaction_embeddings_table.transactionId, transaction_table.id),
    )
    .where(
      and(
        inArray(transaction_table.id, params.transactionIds),
        eq(transaction_table.organizationId, params.organizationId),
        isNull(transaction_embeddings_table.id), // Only transactions without embeddings
      ),
    );
}

export type GetTransactionsForEnrichmentParams = {
  transactionIds: string[];
  organizationId: string;
};

export type TransactionForEnrichment = {
  id: string;
  name: string;
  counterpartyName: string | null;
  merchantName: string | null;
  description: string | null;
  amount: number;
  currency: string;
  categorySlug: string | null;
};

/**
 * Get transactions that need enrichment (no merchantName yet)
 */
export async function getTransactionsForEnrichment(
  db: DBClient,
  params: GetTransactionsForEnrichmentParams,
) {
  if (params.transactionIds.length === 0) {
    return [];
  }

  return db
    .select({
      id: transaction_table.id,
      name: transaction_table.name,
      counterpartyName: transaction_table.counterpartyName,
      merchantName: transaction_table.merchantName,
      description: transaction_table.description,
      amount: transaction_table.amount,
      currency: transaction_table.currency,
      categorySlug: transaction_table.categorySlug,
    })
    .from(transaction_table)
    .where(
      and(
        eq(transaction_table.organizationId, params.organizationId),
        inArray(transaction_table.id, params.transactionIds),
        eq(transaction_table.enrichmentCompleted, false), // Only non-enriched transactions
      ),
    );
}

export type EnrichmentUpdateData = {
  merchantName?: string;
  categorySlug?: string;
};

export type UpdateTransactionEnrichmentParams = {
  transactionId: string;
  data: EnrichmentUpdateData;
};

/**
 * Update multiple transactions with enrichment data using individual updates
 *
 * @param db - Database connection
 * @param updates - Array of updates to apply (max 1000 for safety)
 * @throws Error if batch size exceeds limit or if updates fail
 */
export async function updateTransactionEnrichments(
  db: DBClient,
  updates: UpdateTransactionEnrichmentParams[],
) {
  if (updates.length === 0) {
    return;
  }

  // Safety: Limit batch size to prevent query size issues
  if (updates.length > 1000) {
    throw new Error(
      `Batch size too large: ${updates.length}. Maximum allowed: 1000`,
    );
  }

  // Safety: Validate input data
  for (const update of updates) {
    if (!update.transactionId?.trim()) {
      throw new Error("Invalid transactionId: cannot be empty");
    }
    // At least one field must be provided for update
    if (!update.data.merchantName && !update.data.categorySlug) {
      throw new Error(
        "At least one of merchantName or categorySlug must be provided",
      );
    }
    // If merchantName is provided, it cannot be empty
    if (
      update.data.merchantName !== undefined &&
      !update.data.merchantName?.trim()
    ) {
      throw new Error("Invalid merchantName: cannot be empty when provided");
    }
  }

  try {
    for (const update of updates) {
      const updateData: {
        merchantName?: string;
        categorySlug?: string;
        enrichmentCompleted: boolean;
      } = {
        enrichmentCompleted: true,
      };

      // Only include fields that have values
      if (update.data.merchantName) {
        updateData.merchantName = update.data.merchantName;
      }
      if (update.data.categorySlug) {
        updateData.categorySlug = update.data.categorySlug;
      }

      await db
        .update(transaction_table)
        .set(updateData)
        .where(eq(transaction_table.id, update.transactionId));
    }
  } catch (error) {
    throw new Error(
      `Failed to update transaction enrichments: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Mark transactions as enrichment completed without updating any other fields
 * Used for transactions that don't need merchant/category updates but should be marked as processed
 *
 * @param db - Database connection
 * @param transactionIds - Array of transaction IDs to mark as enriched
 */
export async function markTransactionsAsEnriched(
  db: DBClient,
  transactionIds: string[],
) {
  if (transactionIds.length === 0) {
    return;
  }

  // Safety: Limit batch size to prevent query size issues
  if (transactionIds.length > 1000) {
    throw new Error(
      `Batch size too large: ${transactionIds.length}. Maximum allowed: 1000`,
    );
  }

  // Safety: Validate input data
  for (const id of transactionIds) {
    if (!id?.trim()) {
      throw new Error("Invalid transactionId: cannot be empty");
    }
  }

  try {
    await db
      .update(transaction_table)
      .set({ enrichmentCompleted: true })
      .where(inArray(transaction_table.id, transactionIds));
  } catch (error) {
    throw new Error(
      `Failed to mark transactions as enriched: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export type GetTransactionsInPeriodParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
  period?: "monthly" | "quarterly";
};

export async function getTransactionsInPeriodQuery(
  db: DBClient,
  params: GetTransactionsInPeriodParams,
) {
  // TODO: handle currency conversion when specified by user
  const { organizationId, from, to } = params;

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
      amount: transaction_table.amount,
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
        ),
      ),
    );

  return result;
}

interface IncomeResultItem {
  value: string;
  date: string;
  currency: string;
}

export type GetIncomeParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

// Helper function for revenue calculation
export async function getIncomeQuery(db: DBClient, params: GetIncomeParams) {
  const { organizationId, from, to, currency: inputCurrency } = params;

  // Step 2: Generate month series for complete results
  const monthSeries = eachMonthOfInterval({ start: from, end: to });

  // Step 3: Build the main query conditions
  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    ne(transaction_table.status, "excluded"),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, from),
    lte(transaction_table.date, to),
    gt(transaction_table.amount, 0),
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
    monthlyData.map((item) => [item.month, { value: item.value }]),
  );

  // Step 6: Generate complete results for all months in the series
  const rawData: IncomeResultItem[] = monthSeries.map((monthStart) => {
    const monthKey = format(monthStart, "yyyy-MM-dd");
    const monthData = dataMap.get(monthKey) ?? {
      value: 0,
      recurringValue: 0,
    };

    return {
      date: monthKey,
      value: monthData.value.toString(),
      currency: inputCurrency ?? "EUR",
    };
  });

  const averageIncome =
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
      averageIncome,
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    meta: {
      type: "income",
      currency: rawData?.at(0)?.currency ?? inputCurrency,
    },
    result: rawData?.map((item) => {
      const value = Number.parseFloat(
        Number.parseFloat(item.value || "0").toFixed(2),
      );

      return {
        date: item.date,
        value,
        currency: item.currency,
        total: Number(value.toFixed(2)),
      };
    }),
  };
}

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

  // Step 2: Generate month series for complete results
  const monthSeries = eachMonthOfInterval({ start: from, end: to });

  // Step 3: Build the main query conditions
  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    ne(transaction_table.status, "excluded"),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, from),
    lte(transaction_table.date, to),
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

export type GetExpensesByCategoryParams = {
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

export async function getIncomeByCategoryQuery(
  db: DBClient,
  params: GetExpensesByCategoryParams,
): Promise<SpendingResultItem[]> {
  const { organizationId, from, to, currency: inputCurrency } = params;

  // Step 2: Calculate total spending amount for percentage calculations
  const totalAmountConditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, from),
    lte(transaction_table.date, to),
    gt(transaction_table.amount, 0),
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

  // Step 3: Get all income data in a single aggregated query (MAJOR PERF WIN)
  const incomeConditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, from),
    lte(transaction_table.date, to),
    gt(transaction_table.amount, 0),
    isNotNull(transaction_table.categorySlug), // Only categorized transactions
  ];

  // Single query replaces N queries (where N = number of categories)
  const categoryIncome = await db
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
        ...incomeConditions,
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
    .having(sql`SUM(${transaction_table.amount}) > 0`)
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
  return categoryIncome
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      amount: Number.parseFloat(Number(item.amount).toFixed(2)),
      percentage: Number.parseFloat(Number(item.percentage).toFixed(2)),
    }));
}

export async function getExpensesByCategoryQuery(
  db: DBClient,
  params: GetExpensesByCategoryParams,
): Promise<SpendingResultItem[]> {
  const { organizationId, from, to, currency: inputCurrency } = params;

  // Step 2: Calculate total spending amount for percentage calculations
  const totalAmountConditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, from),
    lte(transaction_table.date, to),
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
    gte(transaction_table.date, from),
    lte(transaction_table.date, to),
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

export type GetRecurringExpensesParams = {
  organizationId: string;
  from: string;
  to: string;
  currency?: string;
};

interface RecurringExpenseItem {
  name: string;
  amount: number;
  frequency: TransactionFrequencyType;
  categoryName: string | null;
  categorySlug: string | null;
}

export async function getRecurringExpensesQuery(
  db: DBClient,
  params: GetRecurringExpensesParams,
) {
  const { organizationId, from, to, currency: inputCurrency } = params;

  // Build conditions
  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.recurring, true),
    eq(transaction_table.internal, false),
    gte(transaction_table.date, from),
    lte(transaction_table.date, to),
    lt(transaction_table.amount, 0), // Expenses only
  ];

  // TODO: group by name won't work if name are different between entries
  // Get all recurring expenses grouped by name and frequency
  const recurringExpenses = await db
    .select({
      name: transaction_table.name,
      date: transaction_table.date,
      frequency: transaction_table.frequency,
      categoryName: transaction_category_table.name,
      categorySlug: transaction_category_table.slug,
      amount: sql<number>`ABS(${transaction_table.amount})`,
    })
    .from(transaction_table)
    .leftJoin(
      transaction_category_table,
      and(
        eq(transaction_category_table.slug, transaction_table.categorySlug),
        eq(transaction_category_table.organizationId, organizationId),
      ),
    )
    .where(and(...conditions))
    .orderBy(desc(transaction_table.date));

  // Calculate totals by frequency
  const frequencyTotals = {
    weekly: 0,
    monthly: 0,
    annually: 0,
    irregular: 0,
  };

  let totalRecurringAmount = 0;

  for (const expense of recurringExpenses) {
    const amount = Number(expense.amount);
    const frequency = (expense.frequency ??
      "irregular") as TransactionFrequencyType;

    // Convert all to monthly equivalent for comparison
    let monthlyEquivalent = 0;
    switch (frequency) {
      case "weekly":
        monthlyEquivalent = amount * 4.33; // Average weeks per month
        frequencyTotals.weekly += amount;
        break;
      case "monthly":
        monthlyEquivalent = amount;
        frequencyTotals.monthly += amount;
        break;
      case "annually":
        monthlyEquivalent = amount / 12;
        frequencyTotals.annually += amount;
        break;
      case "irregular":
        monthlyEquivalent = amount;
        frequencyTotals.irregular += amount;
        break;
    }

    totalRecurringAmount += monthlyEquivalent;
  }

  // Get currency from first expense or use target currency
  const currency = inputCurrency ?? "EUR";

  // Format expenses for return
  const expenses: RecurringExpenseItem[] = recurringExpenses.map((exp) => ({
    name: exp.name,
    amount: Number(Number(exp.amount).toFixed(2)),
    frequency: (exp.frequency ?? "irregular") as TransactionFrequencyType,
    categoryName: exp.categoryName,
    categorySlug: exp.categorySlug,
  }));

  // Calculate the total of all recurring expenses
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return {
    summary: {
      totalMonthlyEquivalent: Number(
        (totalRecurringAmount / recurringExpenses.length).toFixed(2),
      ),
      totalExpensesAmount: total,
      totalExpensesCount: recurringExpenses.length,
      currency,
      byFrequency: {
        weekly: Number(frequencyTotals.weekly.toFixed(2)),
        monthly: Number(frequencyTotals.monthly.toFixed(2)),
        annually: Number(frequencyTotals.annually.toFixed(2)),
        irregular: Number(frequencyTotals.irregular.toFixed(2)),
      },
    },
    expenses,
    meta: {
      type: "recurring_expenses",
      currency,
    },
  };
}

export type GetUncategorizedTransactionsParams = {
  organizationId: string;
  from?: string;
  to?: string;
  currency?: string;
};

export async function getUncategorizedTransactionsQuery(
  db: DBClient,
  params: GetUncategorizedTransactionsParams,
) {
  const { organizationId, from, to, currency } = params;

  const conditions = [
    eq(transaction_table.organizationId, organizationId),
    or(
      eq(transaction_table.categorySlug, "uncategorized"),
      isNull(transaction_table.categorySlug),
    ),
  ];

  if (from) conditions.push(gte(transaction_table.date, from));
  if (to) conditions.push(lte(transaction_table.date, to));

  // TODO: consider splits
  const [result] = await db
    .select({
      total: sql`sum(${transaction_table.amount}) * -1`.mapWith(Number),
      count: count(transaction_table.id),
    })
    .from(transaction_table)
    .where(and(...conditions));

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
