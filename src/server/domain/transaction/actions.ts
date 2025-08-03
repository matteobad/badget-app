"use server";

import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import type {
  CSVRow,
  CSVRowParsed,
} from "~/shared/validators/transaction.schema";
import { revalidateTag } from "next/cache";
import { openai } from "@ai-sdk/openai";
import { parse } from "@fast-csv/parse";
import { authActionClient } from "~/lib/safe-action";
import { db } from "~/server/db";
import { transaction_table } from "~/server/db/schema/transactions";
import { utapi } from "~/server/uploadthing";
import { transformCSV } from "~/shared/helpers/transaction-csv";
import { attachmentDeleteSchema } from "~/shared/validators/attachment.schema";
import { importTransactionSchema } from "~/shared/validators/transaction.schema";
import { categorizeTransactions } from "~/utils/categorization";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";

import { deleteAttachmentMutation } from "../attachment/mutations";

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

export const importTransactionAction = authActionClient
  .inputSchema(importTransactionSchema)
  .metadata({ actionName: "import-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    const userId = ctx.userId;
    const { file, ...options } = parsedInput;

    // upload file and create attachment
    const text = await file.text();

    const data = await new Promise<DB_TransactionInsertType[]>(
      (resolve, reject) => {
        const rows: DB_TransactionInsertType[] = [];

        const parser = parse<CSVRow, CSVRowParsed>({ headers: true })
          .transform((data: CSVRow) => transformCSV(data, options))
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

    // Mutate data
    // const response = await utapi.uploadFiles(file);
    // TODO: add attachment to every transaction
    // const uploadedFile = response.data!;
    // await MUTATIONS.createAttachment({
    //   fileName: uploadedFile.name,
    //   fileKey: uploadedFile.key,
    //   fileUrl: uploadedFile.url,
    //   fileType: uploadedFile.type,
    //   fileSize: uploadedFile.size,
    //   userId: ctx.userId,
    // });
    const categorizedData = await categorizeTransactions(userId, data);
    const parsedTransactions = categorizedData.map((t) => ({ ...t, userId }));

    await db
      .insert(transaction_table)
      // @ts-expect-error type is messeded up by categorizeTransactions
      .values(parsedTransactions);

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "import-transaction-success-message" };
  });
