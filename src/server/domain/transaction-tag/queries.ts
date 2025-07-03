"server-only";

import type { DBClient } from "~/server/db";
import { transaction_to_tag_table } from "~/server/db/schema/transactions";
import { sql } from "drizzle-orm";

export async function existsTransactionToTagQuery(
  client: DBClient,
  input: { tagId: string },
) {
  const { rows } = await client.execute<{ exists: boolean }>(
    sql`SELECT EXISTS (
          SELECT 1 FROM ${transaction_to_tag_table}
          WHERE ${transaction_to_tag_table.tagId} = ${input.tagId}
        ) AS "exists"`,
  );

  return rows[0]?.exists;
}
