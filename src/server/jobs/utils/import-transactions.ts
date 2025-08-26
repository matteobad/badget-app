import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import type { NormalizedTx } from "~/server/domain/transaction/utils";
import type { importTransactionSchema } from "~/shared/validators/transaction.schema";
import type z from "zod/v4";
import { parse } from "@fast-csv/parse";
import { logger } from "@trigger.dev/sdk";
import {
  calculateFingerprint,
  normalizeDescription,
} from "~/server/domain/transaction/utils";
import { createTransactionSchema } from "~/shared/validators/transaction.schema";
import { isValid, parse as parseDate, parseISO } from "date-fns";

import type { RowValidateCallback } from "@fast-csv/parse";

export type ImportTransactionType = z.infer<typeof importTransactionSchema>;

// CSV row interface - can be extended based on actual CSV format
export type CSVRow = Record<string, string | null>;

// Parsed and normalized transaction
export type CSVRowParsed = DB_TransactionInsertType;

function ensureValidYear(dateString: string | undefined) {
  if (!dateString) return new Date().toISOString().split("T")[0]!;

  const [year, month, day] = dateString.split("-");
  const correctedYear =
    year?.length === 4
      ? year.startsWith("20")
        ? year
        : `20${year.slice(2)}`
      : `20${year}`;

  return `${correctedYear}-${month}-${day}`;
}

export function formatDate(date: string) {
  const formats = [
    "dd/MMM/yyyy",
    "dd/MM/yyyy",
    "yyyy-MM-dd",
    "MM/dd/yyyy",
    "dd.MM.yyyy",
    "dd-MM-yyyy",
    "yyyy/MM/dd",
    "MM-dd-yyyy",
    "yyyy.MM.dd",
    "dd MMM yyyy",
    "MMM dd, yyyy",
    "MMMM dd, yyyy",
    "yyyy-MM-dd'T'HH:mm:ss",
    "yyyy-MM-dd HH:mm:ss",
    "dd/MM/yyyy HH:mm:ss",
    "MM/dd/yyyy HH:mm:ss",
    "yyyy/MM/dd HH:mm:ss",
    "dd.MM.yyyy HH:mm:ss",
    "dd-MM-yyyy HH:mm:ss",
    "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
    "yyyy-MM-dd'T'HH:mm:ss",
    "d/M/yy",
  ];

  for (const format of formats) {
    const parsedDate = parseDate(date, format, new Date());
    if (isValid(parsedDate)) {
      return ensureValidYear(parsedDate.toISOString().split("T")[0]);
    }
  }

  try {
    const parsedDate = parseISO(date);
    if (isValid(parsedDate)) {
      return ensureValidYear(parsedDate.toISOString().split("T")[0]);
    }
  } catch {
    // Continue if parseISO fails
  }

  // If the date includes a time, we don't need to remove the time.
  const value = date.includes("T") ? date : date.replace(/[^0-9-\.\/]/g, "");

  try {
    const parsedDate = parseISO(value);
    if (isValid(parsedDate)) {
      return ensureValidYear(parsedDate.toISOString().split("T")[0]);
    }
  } catch {
    // Continue if parseISO fails
  }

  // If all parsing attempts fail, return today
  return new Date().toISOString().split("T")[0]!;
}

export function formatAmountValue({
  amount,
  inverted,
}: {
  amount: string;
  inverted?: boolean;
}) {
  let value: number;

  // Handle special minus sign (−) by replacing with standard minus (-)
  const normalizedAmount = amount
    .replace(/−/g, "-")
    .replace(
      /[\s€$£¥₹₽₩₺₴₦₱₲₵₡₢₳₤₥₧₨₯₰₶₸₺₼₽₾₿₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₸₺₼₽₾₿]/g,
      "",
    )
    .trim();

  if (normalizedAmount.includes(",")) {
    // Remove thousands separators and replace the comma with a period.
    value = +normalizedAmount.replace(/\./g, "").replace(",", ".");
    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  } else if (normalizedAmount.match(/\.\d{2}$/)) {
    // If it ends with .XX, it's likely a decimal; remove internal periods.
    value = +normalizedAmount.replace(/\.(?=\d{3})/g, "");
  } else {
    // If neither condition is met, convert the amount directly to a number
    value = +normalizedAmount;
  }

  if (inverted) {
    return +(value * -1);
  }

  return value;
}

/**
 * Parse CSV content and return normalized transactions
 */
export async function parseCSV(
  csvContent: string,
  options: {
    fieldMapping: ImportTransactionType["fieldMapping"];
    extraFields: ImportTransactionType["extraFields"];
    settings: ImportTransactionType["settings"];
  },
  organizationId: string,
) {
  const parsedTransactions = await new Promise<CSVRowParsed[]>(
    (resolve, reject) => {
      const rows: CSVRowParsed[] = [];

      const parser = parse<CSVRow, CSVRowParsed>({ headers: true })
        .transform((data: CSVRow) =>
          transformRow(data, options, organizationId),
        )
        .validate((row, cb) => validateRow(row, cb))
        .on("error", reject)
        .on("data", (data: CSVRowParsed) => rows.push(data))
        .on("data-invalid", (row, rowNumber, reason) => {
          logger.warn(
            `Invalid [rowNumber=${rowNumber}] [row=${JSON.stringify(row)}] [reason=${reason}]`,
          );
        })
        .on("end", (rowCount: number) => {
          logger.info(`Parsed ${rowCount} rows`);
          resolve(rows.filter(Boolean));
        });

      parser.write(csvContent);
      parser.end();
    },
  );

  if (parsedTransactions.length === 0) {
    throw new Error("No transactions found in CSV");
  }

  return parsedTransactions;
}

/**
 * Transform CSV row content and into normalized transaction
 */
export function transformRow(
  row: CSVRow,
  options: {
    fieldMapping: ImportTransactionType["fieldMapping"];
    extraFields: ImportTransactionType["extraFields"];
    settings: ImportTransactionType["settings"];
  },
  organizationId: string,
) {
  console.info("Raw row", { row });
  const { fieldMapping, extraFields, settings } = options;

  // column mapping
  let column: string;

  let date: string;
  column = fieldMapping.date;
  if (column in row) date = formatDate(row[column]!);
  else throw new Error(`Col ${column} is not present in the CSV`);

  let description: string;
  column = fieldMapping.description;
  if (column in row) description = normalizeDescription(row[column]!);
  else throw new Error(`Col ${column} is not present in the CSV`);

  let amount: number;
  column = fieldMapping.amount;
  if (column in row)
    amount = formatAmountValue({
      amount: row[column]!,
      inverted: settings.inverted,
    });
  else throw new Error(`Col ${column} is not present in the CSV`);

  // add other columns mapping here
  const accountId = extraFields.accountId;

  // Create normalized transaction for fingerprint calculation
  const normalizedTx: NormalizedTx = {
    accountId,
    amount,
    date: new Date(date),
    descriptionNormalized: description,
  };

  const mappedRow: CSVRowParsed = {
    date,
    accountId,
    description,
    name: description,
    amount,
    currency: "EUR",
    method: "other",
    status: "posted",
    source: "csv",
    fingerprint: calculateFingerprint(normalizedTx),
    organizationId,
  };

  return mappedRow;
}

/**
 * Validate parsed CSV row content
 */
export function validateRow(row: CSVRowParsed, cb: RowValidateCallback) {
  const parsedRow = createTransactionSchema.safeParse(row);

  if (!parsedRow.success) {
    cb(parsedRow.error, parsedRow.success, parsedRow.error.message);
  }

  return cb(null, parsedRow.success);
}
