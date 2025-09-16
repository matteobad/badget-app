import { logger, schemaTask } from "@trigger.dev/sdk";
import { list } from "@vercel/blob";
import { db } from "~/server/db";
import { import_table } from "~/server/db/schema/accounts";
import {
  deduplicateTransactions,
  validateTransactions,
} from "~/server/domain/transaction/helpers";
import { max, min } from "date-fns";
import Papa from "papaparse";
import z from "zod/v4";

import { mapTransactions, transform } from "../utils/import-transactions";
import { processBatch } from "../utils/process-batch";
import { recalculateSnapshotsTask } from "./recalculate-snapshots";
import { upsertTransactions } from "./upsert-transactions";

const BATCH_SIZE = 500;

const importTransactionsTaskSchema = z.object({
  inverted: z.boolean(),
  filePath: z.array(z.string()).optional(),
  bankAccountId: z.string(),
  currency: z.string(),
  organizationId: z.string(),
  mappings: z.object({
    amount: z.string(),
    date: z.string(),
    description: z.string(),
  }),
});

export const importTransactionsTask = schemaTask({
  id: "import-transactions",
  schema: importTransactionsTaskSchema,
  maxDuration: 120,
  queue: {
    concurrencyLimit: 5,
  },
  run: async ({
    organizationId,
    filePath,
    bankAccountId,
    currency,
    mappings,
    inverted,
  }) => {
    // Step 1: Get CSV
    if (!filePath) {
      throw new Error("File path is required");
    }

    const blobResponse = await list();
    const blobData = blobResponse.blobs.find(
      (b) => b.pathname === filePath?.join("/"),
    );

    if (!blobData) {
      throw new Error("File path not found");
    }

    const url = new URL(blobData.downloadUrl);
    const response = await fetch(url);
    const content = await response.text();

    if (!content) {
      throw new Error("File content is required");
    }

    // Step 2: Parse CSV
    let valid = 0;
    let invalid = 0;
    let duplicates = 0;
    let minDate: Date | undefined;
    let maxDate: Date | undefined;

    await new Promise((resolve, reject) => {
      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        worker: false,
        complete: resolve,
        error: reject,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        chunk: async (
          chunk: {
            data: Record<string, string>[];
            errors: Array<{ message: string }>;
          },
          parser: Papa.Parser,
        ) => {
          parser.pause();

          const { data } = chunk;

          if (!data?.length) {
            throw new Error("No data in CSV import chunk");
          }

          // Step 2.1: Map & Transform
          logger.info("Map");
          const mappedTransactions = mapTransactions(
            data,
            mappings,
            currency,
            organizationId,
            bankAccountId,
          );

          logger.info("Transform");
          const transactions = mappedTransactions.map((transaction) => {
            const result = transform({ transaction, inverted });
            return result;
          });

          // Step 2.2: Deduplicate
          logger.info("Deduplicate");
          const { newTransactions, duplicateTransactions } =
            await deduplicateTransactions(transactions, bankAccountId);

          // Step 2.3: Validate
          logger.info("Validate");
          const { validTransactions, invalidTransactions } =
            await validateTransactions(newTransactions, bankAccountId);

          // Step 2.4: Insert valid transactions in batches
          logger.info("Batch insert");
          await processBatch(validTransactions, BATCH_SIZE, async (batch) => {
            await upsertTransactions.triggerAndWait({
              bankAccountId: bankAccountId,
              transactions: batch,
              organizationId,
            });

            return data || [];
          });

          // Step 2.5 Get min and max date values from validTransactions
          valid += validTransactions.length;
          invalid += invalidTransactions.length;
          duplicates += duplicateTransactions.length;
          const dates = validTransactions.map((t) => t.date);
          if (dates.length > 0) {
            const minTxDate = min(dates);
            const maxTxDate = max(dates);
            minDate = minDate ? min([minDate, minTxDate]) : minTxDate;
            maxDate = maxDate ? max([maxDate, maxTxDate]) : maxTxDate;
          }

          parser.resume();
        },
      });
    });

    // Step 3: Recalculate snapshots
    if (valid > 0 && minDate) {
      await recalculateSnapshotsTask.triggerAndWait({
        accountId: bankAccountId,
        fromDate: minDate,
        organizationId,
      });
    }

    // Step 4: Record import
    await db.insert(import_table).values({
      organizationId,
      accountId: bankAccountId,
      fileName: filePath.join("/"),
      rowsOk: valid,
      rowsDup: duplicates,
      rowsRej: invalid,
      dateMin: minDate?.toISOString().split("T")[0],
      dateMax: maxDate?.toISOString().split("T")[0],
    });

    return {
      new: valid,
      duplicates: duplicates,
      rejected: invalid,
      range: { min: minDate, max: maxDate },
    };
  },
});
