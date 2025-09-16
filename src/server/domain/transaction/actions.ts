"use server";

import type { exportTransactionsTask } from "~/server/jobs/tasks/export-transactions";
import type { importTransactionsTask } from "~/server/jobs/tasks/import-transactions";
import { google } from "@ai-sdk/google";
import { createStreamableValue } from "@ai-sdk/rsc";
import { parse } from "@fast-csv/parse";
import { tasks } from "@trigger.dev/sdk";
import { authActionClient } from "~/lib/safe-action";
import {
  exportTransactionsSchema,
  importTransactionSchema,
  parseTransactionCSVSchema,
} from "~/shared/validators/transaction.schema";
import { streamObject } from "ai";
import { z } from "zod";

const schema = z.object({
  name: z.string().optional().describe("The name to search for"),
  start: z
    .date()
    .optional()
    .describe("The start date when to retrieve from. Return ISO-8601 format."),
  end: z
    .date()
    .optional()
    .describe(
      "The end date when to retrieve data from. If not provided, defaults to the current date. Return ISO-8601 format.",
    ),
  attachments: z
    .enum(["exclude", "include"])
    .optional()
    .describe(
      "Whether to include or exclude results with attachments or receipts.",
    ),
  categories: z
    .array(z.string())
    .optional()
    .describe("The categories to filter by"),
  tags: z.array(z.string()).optional().describe("The tags to filter by"),
  recurring: z
    .array(z.enum(["all", "weekly", "monthly", "annually"]))
    .optional()
    .describe("The recurring to filter by"),
  amount_range: z
    .array(z.number())
    .optional()
    .describe("The amount range to filter by"),
});

export async function generateTransactionsFilters(
  prompt: string,
  context?: string,
) {
  const stream = createStreamableValue();

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    const { partialObjectStream } = streamObject({
      model: google("gemini-2.5-flash-lite"),
      system: `You are a helpful assistant that generates filters for a given prompt. \n
               Current date is: ${new Date().toISOString().split("T")[0]} \n
               ${context}
      `,
      schema,
      prompt,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}

export async function generateCsvMapping(
  fieldColumns: string[],
  firstRows: Record<string, string>[],
) {
  const stream = createStreamableValue();

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    const { partialObjectStream } = streamObject({
      model: google("gemini-2.5-flash-lite"),
      schema: z.object({
        date: z.iso
          .date()
          .describe(
            "The date of the transaction, return it in ISO-8601 format",
          ),
        description: z.string().describe("The text describing the transaction"),
        amount: z
          .number()
          .describe(
            "The amount involved in the transaction, including the minus sign if present",
          ),
      }),
      prompt: `
        The following columns are the headings from a CSV import file for importing a transactions. 
        Map these column names to the correct fields in our database (date, description, amount) by providing the matching column name for each field.
        You may also consult the first few rows of data to help you make the mapping, but you are mapping the columns, not the values. 
        If you are not sure or there is no matching column, omit the value.

        Columns:
        ${fieldColumns.join(",")}

        First few rows of data:
        ${firstRows.map((row) => JSON.stringify(row)).join("\n")}
      `,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}

export const parseTransactionsCSVAction = authActionClient
  .inputSchema(parseTransactionCSVSchema)
  .metadata({ actionName: "parse-transactions-csv" })
  .action(async ({ parsedInput }) => {
    const { file, maxRows } = parsedInput;
    const text = await file.text();

    return new Promise<Record<string, string>>((resolve, reject) => {
      let firstRow: Record<string, string> = {};

      // Create stream and attach all handlers before writing data
      const stream = parse({ headers: true, maxRows })
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
  });

export const importTransactionsAction = authActionClient
  .inputSchema(importTransactionSchema)
  .metadata({ actionName: "import-transactions-csv" })
  .action(async ({ parsedInput, ctx: { orgId } }) => {
    const { filePath, bankAccountId, currency, mappings, inverted } =
      parsedInput;
    return await tasks.trigger<typeof importTransactionsTask>(
      "import-transactions",
      {
        filePath,
        bankAccountId,
        currency,
        mappings,
        organizationId: orgId,
        inverted,
      },
    );
  });

export const exportTransactionsAction = authActionClient
  .inputSchema(exportTransactionsSchema)
  .metadata({ actionName: "export-transactions" })
  .action(
    async ({
      parsedInput: { transactionIds, dateFormat, locale },
      ctx: { orgId },
    }) => {
      if (!orgId) {
        throw new Error("Organization not found");
      }

      const event = await tasks.trigger<typeof exportTransactionsTask>(
        "export-transactions",
        {
          organizationId: orgId,
          locale,
          transactionIds,
          dateFormat,
        },
      );

      return event;
    },
  );
