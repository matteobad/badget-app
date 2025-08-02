import { createId } from "@paralleldrive/cuid2";
import { pgEnum, unique } from "drizzle-orm/pg-core";

import {
  TRANSACTION_FREQUENCY,
  TRANSACTION_METHOD,
  TRANSACTION_STATUS,
} from "../../../shared/constants/enum";
import { numericCasted, timestamps } from "../utils";
import { pgTable } from "./_table";
import { account_table } from "./accounts";
import { organization as organization_table } from "./auth";
import { category_table } from "./categories";

export const transactionMethodEnum = pgEnum(
  "transaction_method",
  TRANSACTION_METHOD,
);

export const transactionStatusEnum = pgEnum(
  "transaction_status",
  TRANSACTION_STATUS,
);

export const transactionFrequencyEnum = pgEnum(
  "transaction_frequency",
  TRANSACTION_FREQUENCY,
);

export const transaction_table = pgTable(
  "transaction_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .text()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    accountId: d
      .uuid()
      .notNull()
      .references(() => account_table.id),
    categoryId: d.uuid().references(() => category_table.id),

    rawId: d.text().unique(),
    amount: numericCasted({ precision: 10, scale: 2 }).notNull(),
    currency: d.char({ length: 3 }).notNull(),
    date: d.timestamp({ withTimezone: true, mode: "string" }).notNull(),
    name: d.text().notNull(),
    description: d.text(),
    manual: d.boolean().default(false),
    notified: d.boolean().default(false),
    internal: d.boolean().default(false),
    categorySlug: d.text(),
    counterpartyName: d.text(),
    method: transactionMethodEnum().notNull(),
    recurring: d.boolean().notNull().default(false),
    frequency: transactionFrequencyEnum(),
    status: transactionStatusEnum().default("posted").notNull(),
    note: d.text(),

    ...timestamps,
  }),
  (t) => [unique().on(t.organizationId, t.rawId)],
);

export type DB_TransactionType = typeof transaction_table.$inferSelect;
export type DB_TransactionInsertType = typeof transaction_table.$inferInsert;

// TODO: attachment are a completly different feature
export const attachment_table = pgTable("attachment_table", (d) => ({
  id: d
    .varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  organizationId: d
    .text()
    .references(() => organization_table.id, { onDelete: "cascade" })
    .notNull(),
  transactionId: d
    .uuid()
    .references(() => transaction_table.id, { onDelete: "cascade" }),

  fileName: d.text().notNull(),
  fileKey: d.text().notNull(), // Chiave del file in UploadThing (equivalente a file_name su S3)
  fileUrl: d.text().notNull(), // URL pubblico o presigned
  fileType: d.text().notNull(), // MIME type
  fileSize: d.integer().notNull(), // number

  ...timestamps,
}));

export type DB_AttachmentType = typeof attachment_table.$inferSelect;
export type DB_AttachmentInsertType = typeof attachment_table.$inferInsert;

// Tags Table (for multi-label categorization)
export const tag_table = pgTable(
  "tag_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .text()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    text: d.text().notNull(),

    ...timestamps,
  }),
  (t) => [unique().on(t.organizationId, t.text)],
);

export type DB_TagType = typeof tag_table.$inferSelect;
export type DB_TagInsertType = typeof tag_table.$inferInsert;

// Many-to-Many Relationship: Transactions ↔ Tags
export const transaction_to_tag_table = pgTable(
  "transaction_to_tag_table",
  (d) => ({
    id: d
      .varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    transactionId: d
      .uuid()
      .notNull()
      .references(() => transaction_table.id, { onDelete: "cascade" }),
    tagId: d
      .uuid()
      .notNull()
      .references(() => tag_table.id, {
        onDelete: "cascade",
      }),

    ...timestamps,
  }),
  (t) => [unique().on(t.transactionId, t.tagId)],
);

export type DB_TransactionToTagType =
  typeof transaction_to_tag_table.$inferSelect;
export type DB_TransactionToTagInsertType =
  typeof transaction_to_tag_table.$inferInsert;
