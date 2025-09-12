"server-only";

import type { DBClient } from "~/server/db";
import type { TransactionFrequencyType } from "~/shared/constants/enum";
import type { getTransactionTagsSchema } from "~/shared/validators/tag.schema";
import type { getTransactionsSchema } from "~/shared/validators/transaction.schema";
import type { SQL } from "drizzle-orm";
import type z from "zod/v4";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { connection_table } from "~/server/db/schema/open-banking";
import {
  attachment_table,
  tag_table,
  transaction_category_table,
  transaction_embeddings_table,
  transaction_split_table,
  transaction_table,
  transaction_to_tag_table,
} from "~/server/db/schema/transactions";
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
  isNull,
  lt,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";

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
    categories: filterCategories,
    tags: filterTags,
    type,
    accounts: filterAccounts,
    start,
    end,
    recurring: filterRecurring,
    amount: filterAmount,
    amount_range: filterAmountRange,
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
    endDate.setDate(endDate.getDate() + 1);
    whereConditions.push(lte(transaction_table.date, endDate.toISOString()));
  }

  // Search query filter (name, description, or amount)
  if (q) {
    const numericQ = Number.parseFloat(q);
    if (!Number.isNaN(numericQ)) {
      whereConditions.push(sql`${transaction_table.amount} = ${numericQ}`);
    } else {
      // const searchQuery = buildSearchQuery(q);
      // const ftsCondition = sql`to_tsquery('english', ${searchQuery}) @@ ${transactions.ftsVector}`;
      const nameCondition = sql`${transaction_table.name} ILIKE '%' || ${q} || '%'`;
      const descriptionCondition = sql`${transaction_table.description} ILIKE '%' || ${q} || '%'`;
      whereConditions.push(or(nameCondition, descriptionCondition));
    }
  }

  // Categories filter
  if (filterCategories && filterCategories.length > 0) {
    const categoryConditions: (SQL | undefined)[] = [];
    for (const categorySlug of filterCategories) {
      if (categorySlug === "uncategorized") {
        categoryConditions.push(isNull(transaction_category_table.slug));
      } else {
        categoryConditions.push(
          eq(transaction_category_table.slug, categorySlug),
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
    whereConditions.push(ne(transaction_table.categorySlug, "transfer"));
  } else if (type === "income") {
    whereConditions.push(eq(transaction_table.categorySlug, "income"));
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
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${attachment_table.id}, 'filename', ${attachment_table.fileName}, 'path', ${attachment_table.fileUrl}, 'type', ${attachment_table.fileType}, 'size', ${attachment_table.fileSize})) FILTER (WHERE ${attachment_table.id} IS NOT NULL), '[]'::json)`.as(
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
        Array<{ id: string; text: string | null }>
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${tag_table.id}, 'text', ${tag_table.text})) FILTER (WHERE ${tag_table.id} IS NOT NULL), '[]'::json)`.as(
        "tags",
      ),
      splits: sql<
        Array<{
          id: string;
          note: string | null;
          categoryId: string | null;
          amount: number;
        }>
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${transaction_split_table.id}, 'categoryId', ${transaction_split_table.categoryId}, 'note', ${transaction_split_table.note}, 'amount', ${transaction_split_table.amount})) FILTER (WHERE ${transaction_split_table.id} IS NOT NULL), '[]'::json)`.as(
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
      attachment_table,
      and(
        eq(attachment_table.transactionId, transaction_table.id),
        eq(attachment_table.organizationId, orgId),
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
          sql`(EXISTS (SELECT 1 FROM ${attachment_table} WHERE ${eq(attachment_table.transactionId, transaction_table.id)} AND ${eq(attachment_table.organizationId, orgId)}) OR ${transaction_table.status} = 'completed')`,
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
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${attachment_table.id}, 'filename', ${attachment_table.fileName}, 'path', ${attachment_table.fileUrl}, 'type', ${attachment_table.fileType}, 'size', ${attachment_table.fileSize})) FILTER (WHERE ${attachment_table.id} IS NOT NULL), '[]'::json)`.as(
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
        Array<{ id: string; text: string }>
      >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${tag_table.id}, 'text', ${tag_table.text})) FILTER (WHERE ${tag_table.id} IS NOT NULL), '[]'::json)`.as(
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
      attachment_table,
      and(
        eq(attachment_table.transactionId, transaction_table.id),
        eq(attachment_table.organizationId, orgId),
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
      text: tag_table.text,
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
