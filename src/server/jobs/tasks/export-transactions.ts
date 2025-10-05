import { writeToString } from "@fast-csv/format";
import { metadata, schemaTask } from "@trigger.dev/sdk";
import { put } from "@vercel/blob";
import {
  BlobReader,
  BlobWriter,
  TextReader,
  Uint8ArrayReader,
  ZipWriter,
} from "@zip.js/zip.js";
import { db } from "~/server/db";
import { document_table } from "~/server/db/schema/documents";
import { Notifications } from "~/server/services/notifications";
import { format } from "date-fns";
import xlsx from "node-xlsx";
import z from "zod";

import { serializableToBlob } from "../utils/blob";
import { processExportTask } from "./process-export";

const columns = [
  { label: "ID", key: "id" },
  { label: "Date", key: "date" },
  { label: "Description", key: "description" },
  { label: "Additional info", key: "additionalInfo" },
  { label: "Amount", key: "amount" },
  { label: "Currency", key: "currency" },
  { label: "Formatted amount", key: "formattedAmount" },
  { label: "From / To", key: "counterpartyName" },
  { label: "Category", key: "category" },
  { label: "Category description", key: "categoryDescription" },
  { label: "Status", key: "status" },
  { label: "Attachments", key: "attachments" },
  { label: "Balance", key: "balance" },
  { label: "Account", key: "account" },
  { label: "Note", key: "note" },
  { label: "Tags", key: "tags" },
];

// Process transactions in batches of 100
const BATCH_SIZE = 100;

export const exportTransactionsTask = schemaTask({
  id: "export-transactions",
  schema: z.object({
    organizationId: z.uuid(),
    userId: z.uuid(),
    locale: z.string(),
    dateFormat: z.string().nullable().optional(),
    transactionIds: z.array(z.uuid()),
    exportSettings: z
      .object({
        csvDelimiter: z.string(),
        includeCSV: z.boolean(),
        includeXLSX: z.boolean(),
        sendEmail: z.boolean(),
        accountantEmail: z.string().optional(),
      })
      .optional(),
  }),
  maxDuration: 300,
  queue: {
    concurrencyLimit: 10,
  },
  machine: {
    preset: "small-1x",
  },
  run: async ({
    organizationId,
    userId,
    locale,
    transactionIds,
    dateFormat,
    exportSettings,
  }) => {
    const filePath = `export-${format(new Date(), dateFormat ?? "yyyy-MM-dd")}`;
    const path = `${organizationId}/exports`;
    const fileName = `${filePath}.zip`;

    // Use export settings with defaults
    const settings = {
      csvDelimiter: exportSettings?.csvDelimiter ?? ",",
      includeCSV: exportSettings?.includeCSV ?? true,
      includeXLSX: exportSettings?.includeXLSX ?? true,
      sendEmail: exportSettings?.sendEmail ?? false,
      accountantEmail: exportSettings?.accountantEmail,
    };

    metadata.set("progress", 20);

    // Process transactions in batches of 100 and collect results
    // Update progress for each batch
    const results = [];

    const totalBatches = Math.ceil(transactionIds.length / BATCH_SIZE);
    const progressPerBatch = 60 / totalBatches;
    let currentProgress = 20;

    for (let i = 0; i < transactionIds.length; i += BATCH_SIZE) {
      const transactionBatch = transactionIds.slice(i, i + BATCH_SIZE);

      const batchResult = await processExportTask.triggerAndWait({
        ids: transactionBatch,
        locale,
        dateFormat,
      });

      results.push(batchResult);

      currentProgress += progressPerBatch;
      metadata.set("progress", Math.round(currentProgress));
    }

    const rows = results
      .flatMap((r) => (r.ok ? r.output.rows : []))
      //   Date is the first column
      .sort(
        (a, b) =>
          new Date(b[0] as string).getTime() -
          new Date(a[0] as string).getTime(),
      );

    const attachments = results.flatMap((r) =>
      r.ok ? r.output.attachments : [],
    );

    const zipFileWriter = new BlobWriter("application/zip");
    const zipWriter = new ZipWriter(zipFileWriter);

    // Add CSV if enabled
    if (settings.includeCSV) {
      const csv = await writeToString(rows, {
        headers: columns.map((c) => c.label),
        delimiter: settings.csvDelimiter,
      });
      zipWriter.add("transactions.csv", new TextReader(csv));
    }

    // Add XLSX if enabled
    if (settings.includeXLSX) {
      const data = [
        columns.map((c) => c.label), // Header row
        ...rows.map((row) => row.map((cell) => cell ?? "")),
      ];

      const buffer = xlsx.build([
        {
          name: "Transactions",
          data,
          options: {},
        },
      ]);

      zipWriter.add("transactions.xlsx", new Uint8ArrayReader(buffer));
    }

    // await zipWriter.add("transactions.csv", new TextReader(csv));
    // await zipWriter.add("transactions.xlsx", new Uint8ArrayReader(buffer));

    metadata.set("progress", 90);

    // Add attachments to zip
    for (const attachment of attachments) {
      if (attachment.blob) {
        await zipWriter.add(
          attachment.name,
          new BlobReader(serializableToBlob(attachment.blob)),
        );
      }
    }

    const zip = await zipWriter.close();

    metadata.set("progress", 95);

    const fullPath = `${path}/${fileName}`;
    const file = new File([zip], fileName);
    const uploadedFile = await put(fullPath, file, {
      access: "public",
      allowOverwrite: true,
    });

    metadata.set("progress", 100);

    // TODO: Update the documents to completed (it's a zip file)
    // await db
    //   .insert(document_table)
    //   .values({
    //     organizationId,
    //     processingStatus: "completed",
    //     date: format(new Date(), "yyyy-MM-dd"),
    //     name: fullPath,
    //     tag: "export",
    //   })
    //   .onConflictDoNothing();

    // If email is enabled, create a short link for the export
    let downloadLink: string | undefined;
    if (settings.sendEmail && settings.accountantEmail) {
      // TODO: Create a signed URL valid for 7 days
      downloadLink = uploadedFile.downloadUrl;
    }

    // TODO: send email with export link
    const notifications = new Notifications(db);
    return notifications.create("transactions_exported", organizationId, {
      transactionCount: transactionIds.length,
      locale: locale,
      dateFormat: dateFormat || "yyyy-MM-dd",
      downloadLink,
      accountantEmail: settings.accountantEmail,
      sendEmail: settings.sendEmail,
    });
    // await tasks.trigger("notification", {
    //   type: "transactions_exported",
    //   organizationId,
    //   transactionCount: transactionIds.length,
    //   locale: locale,
    //   dateFormat: dateFormat || "yyyy-MM-dd",
    //   downloadLink,
    //   accountantEmail: settings.accountantEmail,
    //   sendEmail: settings.sendEmail,
    // });

    return {
      fileName,
      filePath,
      downloadUrl: uploadedFile.downloadUrl,
      totalItems: rows.length,
    };
  },
});
