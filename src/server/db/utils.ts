import type { SQL } from "drizzle-orm";
import type { PgSelect, PgTable } from "drizzle-orm/pg-core";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { type SQLiteTable } from "drizzle-orm/sqlite-core";

import { category } from "./schema/categorization";
import { bankAccounts, bankTransactions } from "./schema/open-banking";

export const buildConflictUpdateColumns = <
  T extends PgTable | SQLiteTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      const colName = cls[column]?.name;
      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

export function withAccounts<T extends PgSelect>(qb: T) {
  return qb.leftJoin(
    bankAccounts,
    eq(bankAccounts.accountId, bankTransactions.accountId),
  );
}

export function withCategories<T extends PgSelect>(qb: T) {
  return qb.leftJoin(category, eq(category.id, bankTransactions.categoryId));
}

export function withPagination<T extends PgSelect>(
  qb: T,
  page = 1,
  pageSize = 10,
) {
  return qb.limit(pageSize).offset((page - 1) * pageSize);
}

export type DrizzleWhere<T> =
  | SQL<unknown>
  | ((aliases: T) => SQL<T> | undefined)
  | undefined;
