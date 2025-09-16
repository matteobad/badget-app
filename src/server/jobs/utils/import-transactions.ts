import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import type { NormalizedTx } from "~/server/domain/transaction/utils";
import type { importTransactionSchema } from "~/shared/validators/transaction.schema";
import type z from "zod";
import {
  calculateFingerprint,
  normalizeDescription,
} from "~/server/domain/transaction/utils";
import { capitalCase } from "change-case";
import { isValid, parse as parseDate, parseISO } from "date-fns";
import { nanoid } from "nanoid";

export type ImportTransactionType = z.infer<typeof importTransactionSchema>;

export type Transaction = {
  date: string;
  description: string;
  amount: string;
  organizationId: string;
  bankAccountId: string;
  currency: string;
  fingerprint: string;
};

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

export function parseDateValue(date: string) {
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

export function parseAmountValue({
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

export const mapTransactions = (
  data: Record<string, string>[],
  mappings: Record<string, string>,
  currency: string,
  organizationId: string,
  bankAccountId: string,
): Transaction[] => {
  return data.map((row) => ({
    ...(Object.fromEntries(
      Object.entries(mappings)
        .filter(([_, value]) => value !== "")
        .map(([key, value]) => [key, row[value]]),
    ) as Transaction),
    currency,
    organizationId,
    bankAccountId,
  }));
};

export function transform({
  transaction,
  inverted,
}: {
  transaction: Transaction;
  inverted: boolean;
}) {
  const normalizedTx: NormalizedTx = {
    accountId: transaction.bankAccountId,
    amount: parseAmountValue({ amount: transaction.amount, inverted }),
    date: new Date(parseDateValue(transaction.date)),
    descriptionNormalized: normalizeDescription(transaction.description),
  };

  return {
    externalId: `${transaction.organizationId}_${nanoid()}`,
    organizationId: transaction.organizationId,
    status: "posted",
    method: "other",
    date: parseDateValue(transaction.date),
    amount: parseAmountValue({ amount: transaction.amount, inverted }),
    name: transaction?.description && capitalCase(transaction.description),
    source: "csv",
    categorySlug: null,
    accountId: transaction.bankAccountId,
    currency: transaction.currency.toUpperCase(),
    fingerprint: calculateFingerprint(normalizedTx),
    notified: true,
  } satisfies DB_TransactionInsertType;
}
