import type { DBClient } from "~/server/db";
import { transaction_table } from "~/server/db/schema/transactions";
import { and, eq, gte, lte } from "drizzle-orm";

type GetRecurringEntriesByDateParams = {
  organizationId: string;
  date: string;
};

export async function getRecurringEntriesByDateQuery(
  db: DBClient,
  params: GetRecurringEntriesByDateParams,
) {
  const { organizationId, date } = params;

  // Build the where conditions array
  const whereConditions = [
    eq(transaction_table.organizationId, organizationId),
    eq(transaction_table.date, date),
    eq(transaction_table.recurring, true),
  ];

  const data = await db
    .select()
    .from(transaction_table)
    .where(and(...whereConditions))
    .orderBy(transaction_table.createdAt);

  // Calculate total
  const totalAmount = data.reduce((tot, item) => (item.amount ?? 0) + tot, 0);

  return {
    meta: {
      totalAmount,
    },
    data,
  };
}

export type GetRecurringEntriesByRangeParams = {
  organizationId: string;
  from: string;
  to: string;
};

export async function getRecurringEntriesByRangeQuery(
  db: DBClient,
  params: GetRecurringEntriesByRangeParams,
) {
  const { organizationId, from, to } = params;

  // Build the where conditions array
  const whereConditions = [
    eq(transaction_table.organizationId, organizationId),
    // Use gte and lte for date range
    gte(transaction_table.date, from),
    lte(transaction_table.date, to),
    eq(transaction_table.recurring, true),
  ];

  const data = await db
    .select()
    .from(transaction_table)
    .where(and(...whereConditions))
    .orderBy(transaction_table.createdAt);

  // Group entries by date
  type EntryType = (typeof data)[number];
  const result = data.reduce<Record<string, EntryType[]>>((acc, item) => {
    if (item.date) {
      const dateKey = item.date;
      acc[dateKey] ??= [];
      acc[dateKey].push(item);
    }
    return acc;
  }, {});

  // Calculate total amount
  const totalAmount = data.reduce((tot, item) => {
    const amount = item.amount ?? 0;
    return tot + Number(amount);
  }, 0);

  return {
    meta: {
      totalAmount,
      from,
      to,
    },
    result,
  };
}
