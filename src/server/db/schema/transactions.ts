import { createId } from "@paralleldrive/cuid2";
import { index, pgEnum, unique } from "drizzle-orm/pg-core";

import {
  TRANSACTION_FREQUENCY,
  TRANSACTION_METHOD,
  TRANSACTION_SOURCE,
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

export const transactionSourceEnum = pgEnum(
  "transaction_source",
  TRANSACTION_SOURCE,
);

export const transaction_table = pgTable(
  "transaction_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    // FK
    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    accountId: d
      .uuid()
      .notNull()
      .references(() => account_table.id, { onDelete: "cascade" }),

    // Base properties
    amount: numericCasted({ precision: 10, scale: 2 }).notNull(),
    currency: d.char({ length: 3 }).notNull(),
    date: d.date().notNull(),
    name: d.text().notNull(),
    description: d.text(),
    internal: d.boolean().default(false),
    method: transactionMethodEnum().notNull(),
    status: transactionStatusEnum().default("posted").notNull(),
    note: d.text(),

    // Enrichement fields
    categoryId: d.uuid().references(() => category_table.id),
    categorySlug: d.text(),
    counterpartyName: d.text(),
    recurring: d.boolean().notNull().default(false),
    frequency: transactionFrequencyEnum(),
    transferId: d.uuid(), // For double-entry transfers between accounts

    // Metadata for internal use
    externalId: d.text(), // External ID from API or CSV
    fingerprint: d.text().notNull(), // Hash for deduplication
    notified: d.boolean().default(false), // For notification to the user
    source: transactionSourceEnum().notNull().default("manual"), // Source of the transaction

    ...timestamps,
  }),
  (t) => [
    index("idx_transactions_date").using("btree", t.date.asc().nullsLast()),
    index("idx_transactions_organization_id_date_name").using(
      "btree",
      t.organizationId.asc().nullsLast(),
      t.date.asc().nullsLast(),
      t.name.asc().nullsLast(),
    ),
    index("idx_transactions_organization_id_name").using(
      "btree",
      t.organizationId.asc().nullsLast(),
      t.name.asc().nullsLast(),
    ),
    index("transactions_bank_account_id_idx").using(
      "btree",
      t.accountId.asc().nullsLast(),
    ),
    index("transactions_category_slug_idx").using(
      "btree",
      t.categorySlug.asc().nullsLast(),
    ),
    index("transactions_organization_id_idx").using(
      "btree",
      t.organizationId.asc().nullsLast(),
    ),
    index("transactions_fingerprint_idx").using(
      "btree",
      t.accountId.asc().nullsLast(),
      t.fingerprint.asc().nullsLast(),
    ),
    index("transactions_transfer_id_idx").using(
      "btree",
      t.transferId.asc().nullsLast(),
    ),
    unique().on(t.organizationId, t.externalId),
  ],
);

export type DB_TransactionType = typeof transaction_table.$inferSelect;
export type DB_TransactionInsertType = typeof transaction_table.$inferInsert;

export const transaction_embeddings_table = pgTable(
  "transaction_embeddings_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    transactionId: d
      .uuid()
      .references(() => transaction_table.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),

    embedding: d.vector({ dimensions: 768 }),
    sourceText: d.text().notNull(),
    model: d.text("model").notNull().default("gemini-embedding-001"),

    createdAt: d
      .timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }),
  (t) => [
    index("transaction_embeddings_transaction_id_idx").using(
      "btree",
      t.transactionId.asc().nullsLast(),
    ),
    index("transaction_embeddings_team_id_idx").using(
      "btree",
      t.organizationId.asc().nullsLast(),
    ),
    // Vector similarity index for fast cosine similarity searches
    index("transaction_embeddings_vector_idx").using("hnsw", t.embedding),
    unique("transaction_embeddings_unique").on(t.transactionId),
  ],
);

export type DB_TransactionEmbeddingsType =
  typeof transaction_embeddings_table.$inferSelect;
export type DB_TransactionEmbeddingsInsertType =
  typeof transaction_embeddings_table.$inferInsert;

// TODO: attachment are a completly different feature
export const attachment_table = pgTable("attachment_table", (d) => ({
  id: d
    .varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  organizationId: d
    .uuid()
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
      .uuid()
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
