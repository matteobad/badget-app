"use server";

import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import { revalidateTag } from "next/cache";
import { parse } from "@fast-csv/parse";
import { authActionClient } from "~/lib/safe-action";
import { db } from "~/server/db";
import { transaction_table } from "~/server/db/schema/transactions";
import { utapi } from "~/server/uploadthing";
import { importTransactionSchema } from "~/shared/validators/transaction.schema";
import { categorizeTransactions } from "~/utils/categorization";

import type { CSVRow, CSVRowParsed } from "../utils/schemas";
import { transformCSV } from "../utils";
import { AttachmentDeleteSchema } from "../utils/schemas";
import { deleteTransactionAttachment } from "./queries";

// transaction

export const deleteTransactionAttachmentAction = authActionClient
  .inputSchema(AttachmentDeleteSchema)
  .metadata({ actionName: "delete-transaction-attachment" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    // TODO: attachment can be associated to multiple transactions
    // remove it only if it's not associated with anything
    await deleteTransactionAttachment(parsedInput.id, ctx.orgId);
    await utapi.deleteFiles(parsedInput.fileKey);

    // Invalidate cache
    revalidateTag(`attachment_${ctx.orgId}`);

    // Return success message
    return { message: "delete-attachment-success-message" };
  });

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

export const importTransactionAction = authActionClient
  .inputSchema(importTransactionSchema)
  .metadata({ actionName: "import-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    const orgId = ctx.orgId;
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
    //   organizationId: ctx.orgId,
    // });
    const categorizedData = await categorizeTransactions(orgId, data);
    const parsedTransactions = categorizedData.map((t) => ({ ...t, orgId }));

    await db
      .insert(transaction_table)
      // @ts-expect-error type is messeded up by categorizeTransactions
      .values(parsedTransactions);

    // Invalidate cache
    revalidateTag(`transaction_${ctx.orgId}`);
    revalidateTag(`attachment_${ctx.orgId}`);

    // Return success message
    return { message: "import-transaction-success-message" };
  });
