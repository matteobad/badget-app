import type { ClassValue } from "clsx";
import type { Column, ColumnBaseConfig, ColumnDataType } from "drizzle-orm";
import { clsx } from "clsx";
import {
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  not,
  notLike,
} from "drizzle-orm";
import { twMerge } from "tailwind-merge";

import { type DataTableConfig } from "~/configs/data-table";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const euroFormat = (
  value: number | bigint | string,
  options?: Intl.NumberFormatOptions,
) =>
  Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    ...options,
  }).format(typeof value === "string" ? Number(value) : value);

export const logger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

export async function withRetry<TResult>(
  fn: (attempt: number) => TResult | Promise<TResult>,
  {
    maxRetries = 3,
    onError,
    delay,
  }: {
    maxRetries?: number;
    onError?(error: unknown, attempt: number): boolean | undefined;
    delay?: number;
  } = {},
) {
  let retries = 0;
  let lastError: unknown;

  while (retries <= maxRetries) {
    if (delay && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      const res = await fn(retries);
      return res;
    } catch (err) {
      lastError = err;

      if (onError) {
        const shouldRetry = onError(err, retries);
        if (!shouldRetry) {
          break;
        }
      }

      retries++;
    }
  }

  throw lastError;
}

export class ProviderError extends Error {
  code: string;

  constructor({ message, code }: { message: string; code: string }) {
    super(message);
    this.code = this.setCode(code);
  }

  setCode(code: string) {
    // GoCardLess
    if (this.message.startsWith("EUA was valid for")) {
      return "disconnected";
    }

    switch (code) {
      // GoCardLess
      case "AccessExpiredError":
      case "AccountInactiveError":
      case "Account suspended":
        logger("disconnected", this.message);

        return "disconnected";
      default:
        logger("unknown", this.message);

        return "unknown";
    }
  }
}

export function createErrorResponse(error: unknown, requestId: string) {
  if (error instanceof ProviderError) {
    return {
      requestId,
      message: error.message,
      code: error.code,
    };
  }

  return {
    requestId,
    message: String(error),
    code: "unknown",
  };
}

export function getInitials(value?: string) {
  if (!value) return "CC";

  const formatted = value.toUpperCase().replace(/[\s.-]/g, "") ?? "";

  if (formatted.split(" ").length > 1) {
    return `${formatted.charAt(0)}${formatted.charAt(1)}`;
  }

  if (value.length > 1) {
    return formatted.charAt(0) + formatted.charAt(1);
  }

  return formatted.charAt(0);
}

export const colors = [
  "#FF6900", // Orange
  "#FCB900", // Yellow
  "#00D084", // Emerald
  "#8ED1FC", // Sky Blue
  "#0693E3", // Blue
  "#ABB8C3", // Gray
  "#EB144C", // Red
  "#F78DA7", // Pink
  "#9900EF", // Purple
  "#0079BF", // Dark Blue
  "#B6BBBF", // Light Gray
  "#FF5A5F", // Coral
  "#F7C59F", // Peach
  "#8492A6", // Slate
  "#4D5055", // Charcoal
  "#AF5A50", // Terracotta
  "#F9D6E7", // Pale Pink
  "#B5EAEA", // Pale Cyan
  "#B388EB", // Lavender
  "#B04632", // Rust
  "#FF78CB", // Pink
  "#4E5A65", // Gray
  "#01FF70", // Lime
  "#85144b", // Pink
  "#F012BE", // Purple
  "#7FDBFF", // Sky Blue
  "#3D9970", // Olive
  "#AAAAAA", // Silver
  "#111111", // Black
  "#0074D9", // Blue
  "#39CCCC", // Teal
  "#001f3f", // Navy
  "#FF9F1C", // Orange
  "#5E6A71", // Ash
  "#75D701", // Neon Green
  "#B6C8A9", // Lichen
  "#00A9FE", // Electric Blue
  "#EAE8E1", // Bone
  "#CD346C", // Raspberry
  "#FF6FA4", // Pink Sherbet
  "#D667FB", // Purple Mountain Majesty
  "#0080FF", // Azure
  "#656D78", // Dim Gray
  "#F8842C", // Tangerine
  "#FF8CFF", // Carnation Pink
  "#647F6A", // Feldgrau
  "#5E574E", // Field Drab
  "#EF5466", // KU Crimson
  "#B0E0E6", // Powder Blue
  "#EB5E7C", // Rose Pink
  "#8A2BE2", // Blue Violet
  "#6B7C85", // Slate Gray
  "#8C92AC", // Lavender Blue
  "#6C587A", // Eminence
  "#52A1FF", // Azureish White
  "#32CD32", // Lime Green
  "#E04F9F", // Orchid Pink
  "#915C83", // Lilac Bush
  "#4C6B88", // Air Force Blue
  "#587376", // Cadet Blue
  "#C46210", // Buff
  "#65B0D0", // Columbia Blue
  "#2F4F4F", // Dark Slate Gray
  "#528B8B", // Dark Cyan
  "#8B4513", // Saddle Brown
  "#4682B4", // Steel Blue
  "#CD853F", // Peru
  "#FFA07A", // Light Salmon
  "#CD5C5C", // Indian Red
  "#483D8B", // Dark Slate Blue
  "#696969", // Dim Gray
];

export function customHash(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) + value.charCodeAt(i);
    hash = hash & hash;
  }

  return Math.abs(hash);
}

export function getColor(value: string, arrayLength: number) {
  const hashValue = customHash(value);
  const index = hashValue % arrayLength;
  return index;
}

export function getColorFromName(value: string) {
  const index = getColor(value, colors.length);

  return colors[index]!;
}

export function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex]!;
}

export function filterColumn({
  column,
  value,
  isSelectable,
}: {
  column: Column<ColumnBaseConfig<ColumnDataType, string>, object, object>;
  value: string;
  isSelectable?: boolean;
}) {
  const [filterValue, filterOperator] = (value?.split("~").filter(Boolean) ??
    []) as [
    string,
    DataTableConfig["comparisonOperators"][number]["value"] | undefined,
  ];

  if (!filterValue) return;

  if (isSelectable) {
    switch (filterOperator) {
      case "eq":
        return inArray(column, filterValue?.split(".").filter(Boolean) ?? []);
      case "notEq":
        return not(
          inArray(column, filterValue?.split(".").filter(Boolean) ?? []),
        );
      case "isNull":
        return isNull(column);
      case "isNotNull":
        return isNotNull(column);
      default:
        return inArray(column, filterValue?.split(".") ?? []);
    }
  }

  switch (filterOperator) {
    case "ilike":
      return ilike(column, `%${filterValue}%`);
    case "notIlike":
      return notLike(column, `%${filterValue}%`);
    case "startsWith":
      return ilike(column, `${filterValue}%`);
    case "endsWith":
      return ilike(column, `%${filterValue}`);
    case "eq":
      return eq(column, filterValue);
    case "notEq":
      return not(eq(column, filterValue));
    case "isNull":
      return isNull(column);
    case "isNotNull":
      return isNotNull(column);
    default:
      return ilike(column, `%${filterValue}%`);
  }
}
