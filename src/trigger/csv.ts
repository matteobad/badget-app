import { parse } from "@fast-csv/parse";
import { batch, logger, metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { type UploadedFileData } from "uploadthing/types";
import { z } from "zod";

import type { CSVMapping } from "~/utils/schemas";
import { TransactionInsertSchema } from "~/lib/validators/transactions";
import { MUTATIONS } from "~/server/db/queries";
import { CSVMappingSchema } from "~/utils/schemas";

type CSVRow = Record<string, string | null>;
type ParsedCSVRow = z.input<typeof TransactionInsertSchema>;

// Trigger.dev supports up to 500 runs per batch, but we've set it to 50 for this example
const BATCH_SIZE = 50;

function transformCSV(row: CSVRow, mapping: CSVMapping) {
  logger.info("Raw row", { row });

  let date: Date;
  if (mapping.date in row) date = new Date(row[mapping.date]!);
  else throw new Error(`Col ${mapping.date} is not present in the CSV`);

  let description: string;
  if (mapping.description in row) description = row[mapping.description]!;
  else throw new Error(`Col ${mapping.description} is not present in the CSV`);

  let amount: string;
  if (mapping.amount in row) amount = row[mapping.amount]!;
  else throw new Error(`Col ${mapping.amount} is not present in the CSV`);

  // add other columns mapping here

  const mappedRow: ParsedCSVRow = {
    date,
    description,
    amount,
    currency: "EUR",
    accountId: "1",
    attachment_ids: [],
  };

  logger.info("Mapped row", { mappedRow });

  const parsedRow = TransactionInsertSchema.safeParse(mappedRow);

  if (!parsedRow.success) {
    logger.warn("Failed to parse mapped row", {
      originalRow: row,
      mappedRow,
      errors: parsedRow.error,
    });
  }

  logger.info("Parsed row", { parsedRow: parsedRow.data });

  return parsedRow.data;
}

export const csvValidator = schemaTask({
  id: "csv-validator",
  schema: z.object({
    file: z.custom<UploadedFileData>(),
    mapping: CSVMappingSchema,
  }),
  run: async ({ file, mapping }) => {
    logger.info("Handling uploaded file with mapping", { file, mapping });

    metadata.set("status", "fetching");

    const response = await fetch(file.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const body = await response.text();

    metadata.set("status", "parsing");

    const rows = await new Promise<TransactionInsertSchema[]>(
      (resolve, reject) => {
        const rows: TransactionInsertSchema[] = [];

        const parser = parse<CSVRow, ParsedCSVRow>({ headers: true })
          .transform((data: CSVRow) => transformCSV(data, mapping))
          .on("error", reject)
          .on("data", (data: TransactionInsertSchema) => rows.push(data))
          .on("end", (rowCount: number) => {
            console.log(`Parsed ${rowCount} rows`);
            resolve(rows.filter(Boolean));
          });

        parser.write(body);
        parser.end();
      },
    );

    metadata.set("status", "processing").set("totalRows", rows.length);

    // Split the rows in batches of BATCH_SIZE
    const batchedRows = [];

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      batchedRows.push(rows.slice(i, i + BATCH_SIZE));
    }

    metadata.set(
      "batches",
      batchedRows.map((rows) => ({
        count: rows.length,
        status: "queued",
        processed: 0,
        valid: 0,
        invalid: 0,
      })),
    );

    let batchIndex = 0;

    for (const rows of batchedRows) {
      metadata.set(`$.batches.${batchIndex}.status`, "processing");

      const results = await batch.triggerAndWait<typeof handleCSVRow>(
        rows.map((row) => ({
          id: "handle-csv-row",
          payload: { row, batchIndex },
        })),
      );

      const runs = results.runs.filter((run) => run.ok);
      const validRuns = runs.filter((run) => run.output.valid);
      const invalidRuns = runs.filter((run) => !run.output.valid);

      metadata
        .set(`$.batches.${batchIndex}.status`, "complete")
        .set(`$.batches.${batchIndex}.valid`, validRuns.length)
        .set(`$.batches.${batchIndex}.invalid`, invalidRuns.length)
        .increment("totalValid", validRuns.length)
        .increment("totalInvalid", invalidRuns.length);

      batchIndex++;
    }

    metadata.set("status", "complete");

    return {
      file,
      rows,
      rowCount: rows.length,
    };
  },
});

export const handleCSVRow = schemaTask({
  id: "handle-csv-row",
  schema: z.object({
    row: TransactionInsertSchema,
    batchIndex: z.number().int(),
  }),
  run: async ({ row, batchIndex }) => {
    logger.info("Handling CSV row", { row });
    let valid = false;

    try {
      // TODO: pass real userId
      await MUTATIONS.createTransaction({ ...row, userId: "userId" });
      valid = true;
    } catch {
      logger.error("Error inserting transaction");
    }

    metadata.parent
      .increment(`$.batches.${batchIndex}.processed`, 1)
      .increment("totalProcessed", 1)
      .increment("totalApiCalls", Math.floor(Math.random() * 5) + 1);

    return {
      valid,
    };
  },
});
