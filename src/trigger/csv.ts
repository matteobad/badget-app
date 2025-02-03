import { parse } from "@fast-csv/parse";
import { batch, logger, metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

import { TransactionInsertSchema } from "~/lib/validators/transactions";
import { createTransactionMutation } from "~/server/db/queries";
import { UploadedFileData } from "~/utils/schemas";

// Trigger.dev supports up to 500 runs per batch, but we've set it to 50 for this example
const BATCH_SIZE = 50;

export const csvValidator = schemaTask({
  id: "csv-validator",
  schema: UploadedFileData,
  run: async (file) => {
    logger.info("Handling uploaded file", { file });

    metadata.set("status", "fetching");

    const response = await fetch(file.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const body = await response.text();

    metadata.set("status", "parsing");

    const rows = await new Promise<Array<TransactionInsertSchema>>(
      (resolve, reject) => {
        const rows: Array<TransactionInsertSchema> = [];

        const parser = parse({
          headers: true,
          delimiter: ",",
          quote: '"',
          trim: true,
        });

        parser.on("data", (row) => {
          logger.info("Row", { row });

          // accountId in parsing
          const parsedRow = TransactionInsertSchema.safeParse(row);

          if (parsedRow.success) {
            rows.push(parsedRow.data);
          } else {
            logger.warn("Failed to parse row", {
              row,
              errors: parsedRow.error,
            });
          }
        });

        parser.on("end", () => {
          logger.info("CSV parsing complete");

          resolve(rows);
        });

        parser.on("error", reject);

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
      await createTransactionMutation(row);
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
