import type { SQL } from "drizzle-orm";
import type { PgSelect, PgTable } from "drizzle-orm/pg-core";
import { getTableColumns, sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";
import { type SQLiteTable } from "drizzle-orm/sqlite-core";

export const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
  deletedAt: timestamp(),
};

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
