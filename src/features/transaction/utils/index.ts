import type { CSVRow, CSVRowParsed, TransactionImportSchema } from "./schemas";
import { TransactionInsertSchema } from "./schemas";

export function transformCSV(
  row: CSVRow,
  options: {
    fieldMapping: TransactionImportSchema["fieldMapping"];
    extraFields: TransactionImportSchema["extraFields"];
    settings: TransactionImportSchema["settings"];
  },
) {
  console.info("Raw row", { row });
  const { fieldMapping, extraFields, settings } = options;

  // column mapping
  let column: string;

  let date: Date;
  column = fieldMapping.date;
  if (column in row) date = new Date(row[column]!);
  else throw new Error(`Col ${column} is not present in the CSV`);

  let description: string;
  column = fieldMapping.description;
  if (column in row) description = row[column]!;
  else throw new Error(`Col ${column} is not present in the CSV`);

  let amount: string;
  column = fieldMapping.amount;
  if (column in row) amount = parseFloat(row[column]!).toFixed(2);
  else throw new Error(`Col ${column} is not present in the CSV`);

  // settings
  if (settings.inverted) amount = (-parseFloat(amount)).toFixed(2);

  // add other columns mapping here

  const mappedRow: CSVRowParsed = {
    date,
    description,
    amount,
    currency: "EUR",
    ...extraFields,
  };

  console.info("Mapped row", { mappedRow });

  const parsedRow = TransactionInsertSchema.safeParse(mappedRow);

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
