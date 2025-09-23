import type { DBClient } from "~/server/db";
import { sql } from "drizzle-orm";

export type GlobalSearchReturnType = {
  id: string;
  type: string;
  title: string;
  relevance: number;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export type GlobalSemanticSearchParams = {
  organizationId: string;
  searchTerm: string;
  itemsPerTableLimit: number;
  language?: string;
  types?: string[];
  amount?: number;
  amountMin?: number;
  amountMax?: number;
  status?: string;
  currency?: string;
  startDate?: string;
  endDate?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
};

/**
 * This function calls a semantic search stored procedure that implements
 * the following logic (see the corresponding SQL/PLPGSQL for details):
 *
 * - Dynamically builds a query for each table type requested in `params.types`
 * - Applies full-text search (with prefix matching) if a search term is provided
 * - Applies date, amount, status, and currency filters as appropriate for each table
 * - Handles due date filters for invoices
 * - Returns a unified result set with type, id, relevance, created_at, and data
 * - Orders by relevance (if searching) or created_at, and limits results per table
 */
export async function globalSemanticSearchQuery(
  db: DBClient,
  params: GlobalSemanticSearchParams,
): Promise<GlobalSearchReturnType[]> {
  // Prepare types as a Postgres text[] array, or null if not present
  const typesParam =
    Array.isArray(params.types) && params.types.length > 0
      ? sql`ARRAY[${sql.join(
          params.types.map((t) => sql`${t}`),
          sql`, `,
        )}]`
      : null;

  // The correct argument order for global_semantic_search is:
  // organization_id (uuid), search_term (text), start_date (text), end_date (text), types (text[]),
  // amount (numeric), amount_min (numeric), amount_max (numeric), status (text), currency (text),
  // language (text), due_date_start (text), due_date_end (text), max_results (integer), items_per_table_limit (integer)
  const result = await db.execute(
    sql`SELECT * FROM global_semantic_search(
        ${params.organizationId ?? null},            -- organization_id (uuid)
        ${params.searchTerm ?? null},                -- search_term (text)
        ${params.startDate ?? null},                 -- start_date (text)
        ${params.endDate ?? null},                   -- end_date (text)
        ${typesParam ?? null},                       -- types (text[])
        ${params.amount ?? null},                    -- amount (numeric)
        ${params.amountMin ?? null},                 -- amount_min (numeric)
        ${params.amountMax ?? null},                 -- amount_max (numeric)
        ${params.status ?? null},                    -- status (text)
        ${params.currency ?? null},                  -- currency (text)
        ${params.language ?? null},                  -- language (text)
        ${params.dueDateStart ?? null},              -- due_date_start (text)
        ${params.dueDateEnd ?? null},                -- due_date_end (text)
        ${params.itemsPerTableLimit},                -- max_results (integer, default 20)
        ${params.itemsPerTableLimit}                 -- items_per_table_limit (integer, default 5)
      )`,
  );

  return result as unknown as GlobalSearchReturnType[];
}

type GlobalSearchParams = {
  organizationId: string;
  searchTerm?: string;
  limit?: number;
  itemsPerTableLimit?: number;
  language?: string;
  relevanceThreshold?: number;
};

export async function globalSearchQuery(
  db: DBClient,
  params: GlobalSearchParams,
) {
  const result = await db.execute(
    sql`SELECT * FROM global_search(
        ${params.organizationId},
        ${params.searchTerm ?? null},
        ${params.language ?? "english"},
        ${params.limit ?? null},
        ${params.itemsPerTableLimit ?? null},
        ${params.relevanceThreshold ?? null}
      )`,
  );

  return result.rows as unknown as GlobalSearchReturnType[];
}
