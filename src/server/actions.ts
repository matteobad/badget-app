"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { parse } from "@fast-csv/parse";
import { and, eq, sql } from "drizzle-orm";

import { gocardlessClient } from "~/lib/providers/gocardless/gocardless-api";
import { mapRequisitionStatus } from "~/lib/providers/gocardless/gocardless-mappers";
import { authActionClient } from "~/lib/safe-action";
import {
  AttachmentDeleteSchema,
  ConnectGocardlessSchema,
  TransactionDeleteSchema,
  TransactionImportSchema,
  TransactionInsertSchema,
} from "~/lib/validators";
import { db } from "~/server/db";
import { MUTATIONS } from "~/server/db/queries";
import {
  transaction_attachment_table as attachmentSchema,
  transaction_table as transactionSchema,
} from "~/server/db/schema/transactions";
import { utapi } from "~/server/uploadthing";
import { type CSVRow, type CSVRowParsed } from "~/utils/schemas";
import { transformCSV } from "~/utils/transform";
import {
  connection_table as connectionSchema,
  institution_table as institutionSchema,
} from "./db/schema/open-banking";

// Server Action
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

export const connectGocardlessAction = authActionClient
  .schema(ConnectGocardlessSchema)
  .metadata({ actionName: "connect-gocardless" })
  .action(async ({ parsedInput, ctx }) => {
    const { institutionId, provider, redirectBase } = parsedInput;
    const redirectTo = new URL("/settings/sync", redirectBase);
    redirectTo.searchParams.append("provider", provider.toLowerCase());

    const upsertedId = await db
      .update(institutionSchema)
      .set({
        popularity: sql`${institutionSchema.popularity} + 1`,
      })
      .where(eq(institutionSchema.originalId, institutionId))
      .returning();

    const institution = await gocardlessClient.getInstitutionById({
      id: institutionId,
    });

    const agreement = await gocardlessClient.createAgreement({
      institution_id: institutionId,
      access_valid_for_days: institution.max_access_valid_for_days,
      max_historical_days: institution.transaction_total_days,
      access_scope: ["details", "balances", "transactions"],
    });

    const requisition = await gocardlessClient.createRequisition({
      institution_id: institution.id,
      redirect: redirectTo.toString(),
      agreement: agreement.id,
      user_language: "IT",
      // reference: TODO: investigate custom reference
      // account_selection: TODO: integrate account selcetion in the UI before
    });

    await db.insert(connectionSchema).values({
      institutionId: upsertedId[0]!.id,
      provider: provider,
      userId: ctx.userId,
      referenceId: requisition.id,
      status: mapRequisitionStatus(requisition.status),
    });

    return redirect(requisition.link);
  });
