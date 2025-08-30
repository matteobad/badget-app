"use server";

import type { importTransactionsTask } from "~/server/jobs/tasks/import-transactions";
import { revalidateTag } from "next/cache";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { parse } from "@fast-csv/parse";
import { tasks } from "@trigger.dev/sdk";
import { authActionClient } from "~/lib/safe-action";
import { db } from "~/server/db";
import { utapi } from "~/server/uploadthing";
import { attachmentDeleteSchema } from "~/shared/validators/attachment.schema";
import {
  importTransactionSchema,
  parseTransactionCSVSchema,
} from "~/shared/validators/transaction.schema";
import { streamObject } from "ai";
import { z } from "zod/v4";

import {
  createAttachmentMutation,
  deleteAttachmentMutation,
} from "../attachment/mutations";

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
      model: openai("gpt-4o-mini"),
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

export const deleteTransactionAttachmentAction = authActionClient
  .inputSchema(attachmentDeleteSchema)
  .metadata({ actionName: "delete-transaction-attachment" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    // TODO: attachment can be associated to multiple transactions
    // remove it only if it's not associated with anything
    await deleteAttachmentMutation(db, parsedInput.id, ctx.userId);
    await utapi.deleteFiles(parsedInput.fileKey);

    // Invalidate cache
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "delete-attachment-success-message" };
  });

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

export const importTransactionsCSVAction = authActionClient
  .inputSchema(importTransactionSchema)
  .metadata({ actionName: "import-transactions-csv" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    const orgId = ctx.orgId;
    const { file, ...options } = parsedInput;

    // upload file and create attachment
    const response = await utapi.uploadFiles(file);
    const uploadedFile = response.data!;
    await createAttachmentMutation(
      db,
      {
        fileKey: uploadedFile.key,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        fileType: uploadedFile.type,
        fileUrl: uploadedFile.ufsUrl,
        organizationId: orgId,
      },
      orgId,
    );

    return await tasks.trigger<typeof importTransactionsTask>(
      "import-transactions",
      {
        filePath: uploadedFile.ufsUrl,
        organizationId: orgId,
        ...options,
      },
    );
  });
