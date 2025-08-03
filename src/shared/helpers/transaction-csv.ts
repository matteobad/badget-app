import type {
  CSVRow,
  CSVRowParsed,
  importTransactionSchema,
} from "~/shared/validators/transaction.schema";
import type { z } from "zod/v4";
import { parse } from "@fast-csv/parse";
import { createTransactionSchema } from "~/shared/validators/transaction.schema";

type ImportTransactionType = z.infer<typeof importTransactionSchema>;

export function transformCSV(
  row: CSVRow,
  options: {
    fieldMapping: ImportTransactionType["fieldMapping"];
    extraFields: ImportTransactionType["extraFields"];
    settings: ImportTransactionType["settings"];
  },
) {
  console.info("Raw row", { row });
  const { fieldMapping, extraFields, settings } = options;

  // column mapping
  let column: string;

  let date: string;
  column = fieldMapping.date;
  if (column in row) date = new Date(row[column]!).toISOString();
  else throw new Error(`Col ${column} is not present in the CSV`);

  let description: string;
  column = fieldMapping.description;
  if (column in row) description = row[column]!;
  else throw new Error(`Col ${column} is not present in the CSV`);

  let amount: number;
  column = fieldMapping.amount;
  if (column in row) amount = parseFloat(row[column]!);
  else throw new Error(`Col ${column} is not present in the CSV`);

  // settings
  if (settings.inverted) amount *= -1;

  // add other columns mapping here

  const mappedRow: CSVRowParsed = {
    date,
    description,
    amount,
    currency: "EUR",
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

// Import CSV
export async function parseCsv(file: File, maxRows = 9999) {
  const text = await file.text();

  return new Promise<Record<string, string>>((resolve, reject) => {
    let firstRow: Record<string, string> = {};

    // Create stream and attach all handlers before writing data
    const stream = parse({ headers: true, maxRows: maxRows })
      .on("error", (error) => reject(error))
      // .on("headers", (headerList) => (headers = headerList as string[]))
      .on("data", (row) => (firstRow = row as Record<string, string>))
      .on("end", (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);
        resolve(firstRow);
      });

    // Process the CSV text through the stream after all handlers are set up
    stream.write(text);
    stream.end();
  });
}
