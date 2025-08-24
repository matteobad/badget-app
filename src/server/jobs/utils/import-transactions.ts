import { createHash } from "node:crypto";
import type {
  CSVRow,
  CSVRowParsed,
  importTransactionSchema,
} from "~/shared/validators/transaction.schema";
import type z from "zod/v4";
import { createTransactionSchema } from "~/shared/validators/transaction.schema";
import { isValid, parse, parseISO } from "date-fns";

type ImportTransactionType = z.infer<typeof importTransactionSchema>;

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
    const parsedDate = parse(date, format, new Date());
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

function generateTransactionHash(
  accountId: string,
  description: string,
  amount: number,
  date: string, // ISO format
) {
  const normalizedDescription = description.trim().toLowerCase();
  const payload = `${accountId}|${normalizedDescription}|${amount}|${date}`;
  return createHash("sha256").update(payload).digest("hex");
}

export function transform(
  row: CSVRow,
  options: {
    fieldMapping: ImportTransactionType["fieldMapping"];
    extraFields: ImportTransactionType["extraFields"];
    settings: ImportTransactionType["settings"];
  },
  orgId: string,
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
  if (column in row) description = row[column]!;
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

  const mappedRow: CSVRowParsed = {
    date,
    description,
    name: description,
    amount,
    currency: "EUR",
    method: "other",
    status: "posted",
    organizationId: orgId,
    rawId: generateTransactionHash(accountId, description, amount, date),
    ...extraFields,
  };

  console.info("Mapped row", { mappedRow });

  const parsedRow = createTransactionSchema.safeParse(mappedRow);

  if (!parsedRow.success) {
    console.warn("Failed to parse mapped row", {
      originalRow: row,
      mappedRow,
      errors: parsedRow.error,
    });
  }

  console.info("Parsed row", { parsedRow: parsedRow.data });

  return parsedRow.data;
}
