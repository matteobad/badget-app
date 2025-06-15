"use server";

import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import { revalidateTag } from "next/cache";
import { parse } from "@fast-csv/parse";
import { authActionClient } from "~/lib/safe-action";
import { db, withTransaction } from "~/server/db";
import { transaction_table } from "~/server/db/schema/transactions";
import { utapi } from "~/server/uploadthing";
import {
  categorizeTransaction,
  categorizeTransactions,
  updateOrCreateRule,
} from "~/utils/categorization";
import { and, eq } from "drizzle-orm";

import type { CSVRow, CSVRowParsed } from "../utils/schemas";
import { transformCSV } from "../utils";
import {
  AttachmentDeleteSchema,
  CategorizeTransactionSchema,
  TransactionDeleteSchema,
  TransactionImportSchema,
  TransactionInsertSchema,
  TransactionUpdateBulkSchema,
  TransactionUpdateSchema,
} from "../utils/schemas";
import {
  createTransaction,
  deleteTransaction,
  deleteTransactionAttachment,
  updateTransaction,
  updateTransactionAttachment,
  updateTransactionTags,
} from "./queries";

// transaction
export const createTransactionAction = authActionClient
  .inputSchema(TransactionInsertSchema)
  .metadata({ actionName: "create-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Prepare data
    const userId = ctx.userId;
    const categoryId = parsedInput.categoryId;

    // Mutate data
    await withTransaction(async (tx) => {
      // update transaction
      const inserted = await createTransaction({ ...parsedInput, userId }, tx);

      if (!inserted[0]?.id) return tx.rollback();
      const transactionId = inserted[0].id;

      for (const id of parsedInput.attachment_ids) {
        const updatedAttachment = { id, userId, transactionId };
        await updateTransactionAttachment(updatedAttachment, tx);
      }

      // update transaction tags
      const tags = parsedInput.tags.map((t) => t.text);
      await updateTransactionTags(tags, transactionId, userId, tx);

      // update category rule relevance
      const description = parsedInput.description;
      await updateOrCreateRule(userId, description, categoryId);
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "create-transaction-success-message" };
  });

export const updateTransactionAction = authActionClient
  .inputSchema(TransactionUpdateSchema)
  .metadata({ actionName: "update-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Prepare data
    const userId = ctx.userId;
    const transactionId = parsedInput.id;
    const categoryId = parsedInput.categoryId;

    // Mutate data
    await withTransaction(async (tx) => {
      // update transaction
      await updateTransaction({ ...parsedInput, userId }, tx);

      // update transaction attachements
      for (const id of parsedInput.attachment_ids) {
        const updatedAttachment = { id, userId, transactionId };
        await updateTransactionAttachment(updatedAttachment, tx);
      }

      // update transaction tags
      const tags = parsedInput.tags.map((t) => t.text);
      await updateTransactionTags(tags, transactionId, userId, tx);

      // TODO: only id category has changed
      // update category rule relevance
      const description = parsedInput.description;
      await updateOrCreateRule(userId, description, categoryId);
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "update-transaction-success-message" };
  });

export const updateTransactionBulkAction = authActionClient
  .inputSchema(TransactionUpdateBulkSchema)
  .metadata({ actionName: "update-transaction-bulk" })
  .action(async ({ parsedInput, ctx }) => {
    // Prepare data
    const userId = ctx.userId;
    const { categoryId } = parsedInput;

    // Mutate data
    await withTransaction(async (tx) => {
      // update transaction
      for (const id of parsedInput.ids) {
        await tx
          .update(transaction_table)
          .set({ categoryId })
          .where(
            and(
              eq(transaction_table.id, id),
              eq(transaction_table.userId, userId),
            ),
          );
      }
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);

    // Return success message
    return { message: "update-transaction-success-message" };
  });

export const deleteTransactionAction = authActionClient
  .inputSchema(TransactionDeleteSchema)
  .metadata({ actionName: "delete-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await withTransaction(async (tx) => {
      for (const id of parsedInput.ids) {
        await deleteTransaction(id, ctx.userId, tx);
      }
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);

    // Return success message
    return { message: "delete-transaction-success-message" };
  });

export const deleteTransactionAttachmentAction = authActionClient
  .inputSchema(AttachmentDeleteSchema)
  .metadata({ actionName: "delete-transaction-attachment" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    // TODO: attachment can be associated to multiple transactions
    // remove it only if it's not associated with anything
    await deleteTransactionAttachment(parsedInput.id, ctx.userId);
    await utapi.deleteFiles(parsedInput.fileKey);

    // Invalidate cache
    revalidateTag(`attachment_${ctx.userId}`);

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
  .schema(TransactionImportSchema)
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

export const categorizeTransactionAction = authActionClient
  .schema(CategorizeTransactionSchema)
  .metadata({ actionName: "categorize-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    const categoryId = await categorizeTransaction(ctx.userId, parsedInput);
    return { categoryId };
  });
