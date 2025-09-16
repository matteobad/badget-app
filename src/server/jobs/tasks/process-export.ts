import { schemaTask } from "@trigger.dev/sdk";
import { list } from "@vercel/blob";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import {
  tag_table,
  transaction_attachment_table,
  transaction_category_table,
  transaction_table,
  transaction_to_tag_table,
} from "~/server/db/schema/transactions";
import { format, parseISO } from "date-fns";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { blobToSerializable } from "../utils/blob";
import { ensureFileExtension } from "../utils/mime-to-extension";
import { processBatch } from "../utils/process-batch";

const ATTACHMENT_BATCH_SIZE = 20;

export const processExportTask = schemaTask({
  id: "process-export",
  schema: z.object({
    ids: z.array(z.uuid()),
    locale: z.string(),
    dateFormat: z.string().nullable().optional(),
  }),
  maxDuration: 300,
  queue: {
    concurrencyLimit: 5,
  },
  machine: {
    preset: "small-1x",
  },
  run: async ({ ids, locale, dateFormat }) => {
    const transactionsData = await db
      .select({
        id: transaction_table.id,
        date: transaction_table.date,
        name: transaction_table.name,
        description: transaction_table.description,
        amount: transaction_table.amount,
        note: transaction_table.note,
        currency: transaction_table.currency,
        counterparty_name: transaction_table.counterpartyName,
        status: transaction_table.status,
        attachments: sql<
          Array<{
            id: string;
            filename: string | null;
            path: string[] | null;
            type: string;
            size: number;
          }>
        >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${transaction_attachment_table.id}, 'filename', ${transaction_attachment_table.name}, 'path', ${transaction_attachment_table.path}, 'type', ${transaction_attachment_table.type}, 'size', ${transaction_attachment_table.size})) FILTER (WHERE ${transaction_attachment_table.id} IS NOT NULL), '[]'::json)`.as(
          "attachments",
        ),
        category: {
          id: transaction_category_table.id,
          name: transaction_category_table.name,
          description: transaction_category_table.description,
        },
        bank_account: {
          id: account_table.id,
          name: account_table.name,
        },
        tags: sql<
          Array<{ id: string; text: string | null }>
        >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${tag_table.id}, 'text', ${tag_table.text})) FILTER (WHERE ${tag_table.id} IS NOT NULL), '[]'::json)`.as(
          "tags",
        ),
      })
      .from(transaction_table)
      .leftJoin(
        transaction_category_table,
        and(
          eq(transaction_table.categorySlug, transaction_category_table.slug),
          eq(
            transaction_table.organizationId,
            transaction_category_table.organizationId,
          ),
        ),
      )
      .leftJoin(
        account_table,
        eq(transaction_table.accountId, account_table.id),
      )
      .leftJoin(
        transaction_to_tag_table,
        eq(transaction_to_tag_table.transactionId, transaction_table.id),
      )
      .leftJoin(tag_table, eq(tag_table.id, transaction_to_tag_table.tagId))
      .leftJoin(
        transaction_attachment_table,
        eq(transaction_attachment_table.transactionId, transaction_table.id),
      )
      .where(inArray(transaction_table.id, ids))
      .groupBy(
        transaction_table.id,
        transaction_table.date,
        transaction_table.amount,
        transaction_table.currency,
        transaction_table.status,
        transaction_table.note,
        transaction_table.source,
        transaction_table.counterpartyName,
        transaction_table.name,
        transaction_table.description,
        transaction_category_table.id,
        transaction_category_table.name,
        account_table.id,
        account_table.name,
      );

    const attachments = await processBatch(
      transactionsData ?? [],
      ATTACHMENT_BATCH_SIZE,
      async (batch) => {
        const blobResponse = await list();
        const batchAttachments = await Promise.all(
          batch.flatMap((transaction, idx) => {
            const rowId = idx + 1;
            return (transaction.attachments ?? []).map(
              async (attachment, idx2: number) => {
                const originalName = attachment.filename ?? "attachment";

                // Only apply MIME type extension if we have a valid MIME type
                const nameWithExtension = attachment.type
                  ? ensureFileExtension(originalName, attachment.type)
                  : originalName;
                const baseFilename = nameWithExtension.replace(/\.[^.]*$/, "");

                // Extract extension properly - if no extension exists, use "bin"
                const parts = nameWithExtension.split(".");
                const extension = parts.length > 1 ? parts.pop()! : "bin";

                const name =
                  idx2 > 0
                    ? `${baseFilename}-${rowId}_${idx2}.${extension}`
                    : `${baseFilename}-${rowId}.${extension}`;

                let data: Blob | undefined;
                const blobData = blobResponse.blobs.find(
                  (b) => b.pathname === (attachment.path ?? []).join("/"),
                );

                if (blobData) {
                  const url = new URL(blobData.downloadUrl);
                  const response = await fetch(url);
                  data = await response.blob();
                }

                return {
                  id: transaction.id,
                  name,
                  blob: data ? await blobToSerializable(data) : null,
                };
              },
            );
          }),
        );

        return batchAttachments.flat();
      },
    );

    const rows = transactionsData
      ?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((transaction) => {
        return [
          transaction.id,
          format(parseISO(transaction.date), dateFormat ?? "LLL dd, y"),
          transaction.name,
          transaction.description,
          transaction.amount,
          transaction.currency,
          Intl.NumberFormat(locale, {
            style: "currency",
            currency: transaction.currency,
          }).format(transaction.amount),
          transaction?.counterparty_name ?? "",
          transaction?.category?.name ?? "",
          transaction?.category?.description ?? "",
          transaction?.attachments?.length > 0 ||
          transaction?.status === "completed"
            ? "Completed"
            : "Not completed",

          attachments
            .filter((a) => a.id === transaction.id)
            .map((a) => a.name)
            .join(", ") ?? "",

          transaction?.bank_account?.name ?? "",
          transaction?.note ?? "",
          transaction?.tags?.map((t) => t.text).join(", ") ?? "",
        ];
      });

    return {
      rows: rows ?? [],
      attachments: attachments ?? [],
    };
  },
});
