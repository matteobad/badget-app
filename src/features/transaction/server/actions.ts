"use server";

import { revalidateTag } from "next/cache";
import { parse } from "@fast-csv/parse";
import { and, eq } from "drizzle-orm";

import type { CSVRow, CSVRowParsed } from "../utils/schemas";
import {
  categorizeTransaction,
  updateOrCreateRule,
} from "~/lib/categorization";
import { authActionClient } from "~/lib/safe-action";
import { db } from "~/server/db";
import { MUTATIONS } from "~/server/db/queries";
import {
  attachment_table,
  transaction_table,
} from "~/server/db/schema/transactions";
import { utapi } from "~/server/uploadthing";
import { transformCSV } from "../utils";
import {
  AttachmentDeleteSchema,
  CategorizeTransactionSchema,
  TransactionDeleteSchema,
  TransactionImportSchema,
  TransactionInsertSchema,
  TransactionUpdateSchema,
} from "../utils/schemas";

// transaction
export const createTransactionAction = authActionClient
  .schema(TransactionInsertSchema)
  .metadata({ actionName: "create-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(transaction_table)
        .values({ ...parsedInput, userId: ctx.userId })
        .returning({ id: transaction_table.id });

      if (!inserted[0]?.id) return tx.rollback();

      for (const id of parsedInput.attachment_ids) {
        await tx
          .update(attachment_table)
          .set({ transactionId: inserted[0].id })
          .where(
            and(
              eq(attachment_table.id, id),
              eq(attachment_table.userId, ctx.userId),
            ),
          );
      }

      // handle tags
      const userId = ctx.userId;
      const tags = parsedInput.tags.map((t) => t.text);
      // TODO: do the same for attachment, centralize logic
      await MUTATIONS.updateTagsOnTransaction(tags, inserted[0].id, userId, tx);
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);
    revalidateTag(`tag_${ctx.userId}`);
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "Transaction created" };
  });

export const updateTransactionAction = authActionClient
  .schema(TransactionUpdateSchema)
  .metadata({ actionName: "update-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db.transaction(async (tx) => {
      // update transactions
      await tx
        .update(transaction_table)
        .set({ ...parsedInput, userId: ctx.userId })
        .where(
          and(
            eq(transaction_table.userId, ctx.userId),
            eq(transaction_table.id, parsedInput.id),
          ),
        );

      // handle attachements
      for (const id of parsedInput.attachment_ids) {
        await tx
          .update(attachment_table)
          .set({ transactionId: parsedInput.id })
          .where(
            and(
              eq(attachment_table.id, id),
              eq(attachment_table.userId, ctx.userId),
            ),
          );
      }

      // handle tags
      const userId = ctx.userId;
      const tags = parsedInput.tags.map((t) => t.text);
      await MUTATIONS.updateTagsOnTransaction(tags, parsedInput.id, userId, tx);

      // handle category
      await updateOrCreateRule(
        userId,
        parsedInput.description,
        parsedInput.categoryId,
      );
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "Transaction updated" };
  });

export const deleteTransactionAction = authActionClient
  .schema(TransactionDeleteSchema)
  .metadata({ actionName: "delete-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db.transaction(async (tx) => {
      for (const id of parsedInput.ids) {
        await tx.delete(transaction_table).where(eq(transaction_table.id, id));
      }
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);

    // Return success message
    return { message: "Transaction deleted" };
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
    const { file, ...options } = parsedInput;

    // upload file and create attachment
    const text = await file.text();

    const data = await new Promise<TransactionInsertSchema[]>(
      (resolve, reject) => {
        const rows: TransactionInsertSchema[] = [];

        const parser = parse<CSVRow, CSVRowParsed>({ headers: true })
          .transform((data: CSVRow) => transformCSV(data, options))
          .on("error", reject)
          .on("data", (data: TransactionInsertSchema) => rows.push(data))
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
    for (const item of data) {
      await MUTATIONS.createTransaction({ ...item, userId: ctx.userId });
    }

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "Transaction created" };
  });

// attachment
export const deleteAttachmentAction = authActionClient
  .schema(AttachmentDeleteSchema)
  .metadata({ actionName: "delete-attachment" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await MUTATIONS.deleteAttachment(parsedInput.id, ctx.userId);
    await utapi.deleteFiles(parsedInput.fileKey);

    // Invalidate cache
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "Attachment deleted" };
  });

export const categorizeTransactionAction = authActionClient
  .schema(CategorizeTransactionSchema)
  .metadata({ actionName: "categorize-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    const categoryId = await categorizeTransaction(ctx.userId, parsedInput);

    // Return success message
    return { categoryId };
  });
