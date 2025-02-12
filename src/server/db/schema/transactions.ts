import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  char,
  integer,
  numeric,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "../utils";
import { pgTable } from "./_table";
import { account_table } from "./accounts";
import { category_table } from "./categories";
import { transactionsToCategories } from "./transactions-to-categories";

export const transaction_table = pgTable("transaction_table", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  userId: varchar({ length: 32 }).notNull(),
  accountId: varchar({ length: 128 })
    .notNull()
    .references(() => account_table.id),
  categoryId: varchar({ length: 128 })
    .notNull()
    .references(() => category_table.id),

  amount: numeric({ precision: 10, scale: 2 }).notNull(),
  currency: char({ length: 3 }).notNull(),
  date: timestamp({ withTimezone: true }).notNull(),
  description: text().notNull(),
  note: text(),

  ...timestamps,
});

export const transactionsRelations = relations(
  transaction_table,
  ({ one, many }) => ({
    account: one(account_table, {
      fields: [transaction_table.accountId],
      references: [account_table.id],
    }),
    transactionCategories: many(transactionsToCategories),
    attachments: many(transaction_attachment_table),
  }),
);

export type DB_TransactionType = typeof transaction_table.$inferSelect;
export type DB_TransactionInsertType = typeof transaction_table.$inferInsert;

export const transaction_attachment_table = pgTable(
  "transaction_attachment_table",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    userId: varchar({ length: 32 }).notNull(),
    transactionId: varchar({ length: 128 }).references(
      () => transaction_table.id,
      { onDelete: "cascade" },
    ),

    fileName: text().notNull(),
    fileKey: text().notNull(), // Chiave del file in UploadThing (equivalente a file_name su S3)
    fileUrl: text().notNull(), // URL pubblico o presigned
    fileType: text().notNull(), // MIME type
    fileSize: integer().notNull(), // number

    ...timestamps,
  },
);

export type DB_AttachmentType =
  typeof transaction_attachment_table.$inferSelect;
export type DB_AttachmentInsertType =
  typeof transaction_attachment_table.$inferInsert;
