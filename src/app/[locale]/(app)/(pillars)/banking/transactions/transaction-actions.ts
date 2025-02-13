"use server";

import { revalidateTag } from "next/cache";
import { parse } from "@fast-csv/parse";
import { and, eq } from "drizzle-orm";
import { type z } from "zod";

import { authActionClient } from "~/lib/safe-action";
import {
  AttachmentDeleteSchema,
  TransactionDeleteSchema,
  TransactionImportSchema,
  TransactionInsertSchema,
} from "~/lib/validators/transactions";
import { db } from "~/server/db";
import { MUTATIONS } from "~/server/db/queries";
import {
  transaction_attachment_table as attachmentSchema,
  transaction_table as transactionSchema,
} from "~/server/db/schema/transactions";
import { utapi } from "~/server/uploadthing";

type CSVRow = Record<string, string | null>;
type CSVRowParsed = z.input<typeof TransactionInsertSchema>;

function transformCSV(
  row: CSVRow,
  options: {
    fieldMapping: TransactionImportSchema["fieldMapping"];
    extraFields: TransactionImportSchema["extraFields"];
    settings: TransactionImportSchema["settings"];
  },
) {
  console.info("Raw row", { row });
  const { fieldMapping, extraFields, settings } = options;

  // column mapping
  let column: string;

  let date: Date;
  column = fieldMapping.date;
  if (column in row) date = new Date(row[column]!);
  else throw new Error(`Col ${column} is not present in the CSV`);

  let description: string;
  column = fieldMapping.description;
  if (column in row) description = row[column]!;
  else throw new Error(`Col ${column} is not present in the CSV`);

  let amount: string;
  column = fieldMapping.amount;
  if (column in row) amount = parseFloat(row[column]!).toFixed(2);
  else throw new Error(`Col ${column} is not present in the CSV`);

  // settings
  if (settings.inverted) amount = (-parseFloat(amount)).toFixed(2);

  // add other columns mapping here

  const mappedRow: CSVRowParsed = {
    date,
    description,
    amount,
    currency: "EUR",
    attachment_ids: [], // TODO: add csv as attachment
    ...extraFields,
  };

  console.info("Mapped row", { mappedRow });

  const parsedRow = TransactionInsertSchema.safeParse(mappedRow);

  if (!parsedRow.success) {
    console.warn("Failed to parse mapped row", {
      originalRow: row,
      mappedRow,
      errors: parsedRow.error,
    });
  }

  console.info("Parsed row", { parsedRow: parsedRow.data });

  return parsedRow.data;
}

export const createTransactionAction = authActionClient
  .schema(TransactionInsertSchema)
  .metadata({ actionName: "create-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(transactionSchema)
        .values({ ...parsedInput, userId: ctx.userId })
        .returning({ insertedId: transactionSchema.id });

      if (!inserted[0]?.insertedId) return tx.rollback();

      for (const id of parsedInput.attachment_ids) {
        await tx
          .update(attachmentSchema)
          .set({ transactionId: inserted[0]?.insertedId })
          .where(
            and(
              eq(attachmentSchema.id, id),
              eq(attachmentSchema.userId, ctx.userId),
            ),
          );
      }
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "Transaction created" };
  });

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

export const deleteTransactionAction = authActionClient
  .schema(TransactionDeleteSchema)
  .metadata({ actionName: "delete-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db.transaction(async (tx) => {
      for (const id of parsedInput.ids) {
        await tx.delete(transactionSchema).where(eq(transactionSchema.id, id));
      }
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);

    // Return success message
    return { message: "Transaction deleted" };
  });

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
