import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import type {
  CSVRow,
  CSVRowParsed,
} from "~/shared/validators/transaction.schema";
import { parse } from "@fast-csv/parse";
import { schemaTask } from "@trigger.dev/sdk";
import z from "zod/v4";

import { transform } from "../utils/import-transactions";
import { upsertTransactions } from "./upsert-transactions";

const BATCH_SIZE = 500;

const importTransactionsTaskSchema = z.object({
  filePath: z.string(),
  orgId: z.string(),
  fieldMapping: z.object({
    date: z.string({ message: "Missing date mapping" }),
    description: z.string({ message: "Missing description mapping" }),
    amount: z.string({ message: "Missing amount mapping" }),
    currency: z.string(),
  }),
  extraFields: z.object({ accountId: z.string() }),
  settings: z.object({ inverted: z.boolean() }),
});

export const importTransactionsTask = schemaTask({
  id: "import-transactions",
  schema: importTransactionsTaskSchema,
  maxDuration: 120,
  queue: {
    concurrencyLimit: 5,
  },
  run: async ({ filePath, orgId, ...options }) => {
    const url = new URL(filePath);
    const response = await fetch(url);
    const text = await response.text();

    const parsedTransactions = await new Promise<DB_TransactionInsertType[]>(
      (resolve, reject) => {
        const rows: DB_TransactionInsertType[] = [];

        const parser = parse<CSVRow, CSVRowParsed>({ headers: true })
          .transform((data: CSVRow) => transform(data, options, orgId))
          .on("error", reject)
          .on("data", (data: DB_TransactionInsertType) => rows.push(data))
          .on("end", (rowCount: number) => {
            console.log(`Parsed ${rowCount} rows`);
            resolve(rows.filter(Boolean));
          });

        parser.write(text);
        parser.end();
      },
    );

    // Upsert transactions in batches of 500
    // This is to avoid memory issues with the DB
    for (let i = 0; i < parsedTransactions.length; i += BATCH_SIZE) {
      const transactionBatch = parsedTransactions.slice(i, i + BATCH_SIZE);
      await upsertTransactions.triggerAndWait({
        transactions: transactionBatch,
        organizationId: orgId,
        bankAccountId: options.extraFields.accountId,
        manualSync: true,
      });
    }
  },
});
