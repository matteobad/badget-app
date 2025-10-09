import type { SQL } from "drizzle-orm";
import { getTableColumns, sql } from "drizzle-orm";
import type { PgSelect, PgTable } from "drizzle-orm/pg-core";
import { customType, timestamp } from "drizzle-orm/pg-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import {
  RANGE_LB_INC,
  Range,
  parse as rangeParse,
  serialize as rangeSerialize,
} from "postgres-range";

export type DrizzleWhere<T> =
  | SQL<unknown>
  | ((aliases: T) => SQL<T> | undefined)
  | undefined;

export const timestamps = {
  createdAt: timestamp({ withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "string" }).$onUpdate(() =>
    new Date().toISOString(),
  ),
  deletedAt: timestamp({ withTimezone: true, mode: "string" }),
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

interface TimeRangeInput {
  endMs: number;
  startMs: number;
}

type RangeBound<T> = {
  value: T;
  inclusive: boolean;
};

// TODO: change to drizzle TimezoneRange when it will be supported (discussion: https://github.com/drizzle-team/drizzle-orm/discussions/2438).
export class TimezoneRange {
  constructor(public readonly range: Range<Date | null>) {}

  get start(): RangeBound<Date> | null {
    return this.range.lower != null
      ? {
          value: new Date(this.range.lower),
          inclusive: this.range.isLowerBoundClosed(),
        }
      : null;
  }

  get end(): RangeBound<Date> | null {
    return this.range.upper != null
      ? {
          value: new Date(this.range.upper),
          inclusive: this.range.isUpperBoundClosed(),
        }
      : null;
  }

  static fromInput(input: TimeRangeInput): TimezoneRange {
    const range = new Range<Date>(
      new Date(input.startMs),
      new Date(input.endMs),
      RANGE_LB_INC,
    );

    return new TimezoneRange(range);
  }
}

export const timezoneRange = customType<{
  data: TimezoneRange;
}>({
  dataType: () => "tstzrange",
  fromDriver: (value: unknown): TimezoneRange => {
    if (typeof value !== "string") {
      throw new Error("Expected string");
    }

    const parsed = rangeParse(value, (val) => new Date(val));
    return new TimezoneRange(parsed);
  },
  toDriver: (value: TimezoneRange): string => {
    const res = rangeSerialize(
      value.range,
      (date) => date?.toISOString() ?? "",
    );
    return res.replaceAll('""', "");
  },
});

type NumericConfig = {
  precision?: number;
  scale?: number;
};

export const numericCasted = customType<{
  data: number;
  driverData: string;
  config: NumericConfig;
}>({
  dataType: (config) => {
    if (config?.precision && config?.scale) {
      return `numeric(${config.precision}, ${config.scale})`;
    }
    return "numeric";
  },
  fromDriver: (value: string) => Number.parseFloat(value),
  toDriver: (value: number) => value.toString(),
});

export const tsvector = customType<{
  data: string;
}>({
  dataType() {
    return "tsvector";
  },
});

export const buildSearchQuery = (input: string) => {
  return input
    .trim()
    .split(/\s+/)
    .map((term) => `${term.toLowerCase()}:*`)
    .join(" & ");
};
