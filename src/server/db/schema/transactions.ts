import type { SQL } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { foreignKey, index, pgEnum, unique } from "drizzle-orm/pg-core";

import {
  TRANSACTION_FREQUENCY,
  TRANSACTION_METHOD,
  TRANSACTION_SOURCE,
  TRANSACTION_STATUS,
} from "../../../shared/constants/enum";
import { numericCasted, timestamps, tsvector } from "../utils";
import { pgTable } from "./_table";
import { account_table } from "./accounts";
import { organization as organization_table } from "./auth";

// Enums
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

// Tables
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
    categorySlug: d.text(),
    counterpartyName: d.text(),
    recurring: d.boolean().notNull().default(false),
    frequency: transactionFrequencyEnum(),
    transferId: d.uuid(), // For double-entry transfers between accounts
    merchantName: d.text(),
    enrichmentCompleted: d.boolean().default(false),

    // Metadata for internal use
    externalId: d.text(), // External ID from API or CSV
    fingerprint: d.text().notNull(), // Hash for deduplication
    notified: d.boolean().default(false), // For notification to the user
    source: transactionSourceEnum().notNull().default("manual"), // Source of the transaction
    ftsVector: tsvector("fts_vector")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`
				to_tsvector(
					'english',
					(
						(COALESCE(name, ''::text) || ' '::text) || COALESCE(description, ''::text)
					)
				)
			`,
      ),

    ...timestamps,
  }),
  (t) => [
    foreignKey({
      columns: [t.organizationId, t.categorySlug],
      foreignColumns: [
        transaction_category_table.organizationId,
        transaction_category_table.slug,
      ],
      name: "transactions_category_slug_organization_id_fkey",
    }),
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
    index("idx_transactions_fts").using(
      "gin",
      t.ftsVector.asc().nullsLast().op("tsvector_ops"),
    ),
    index("idx_transactions_fts_vector").using(
      "gin",
      t.ftsVector.asc().nullsLast().op("tsvector_ops"),
    ),
    unique().on(t.organizationId, t.externalId),
  ],
);

export const transaction_split_table = pgTable(
  "transaction_split_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    transactionId: d
      .uuid()
      .references(() => transaction_table.id, { onDelete: "cascade" })
      .notNull(),

    categorySlug: d.text(),
    amount: numericCasted({ precision: 10, scale: 2 }).notNull(),
    note: d.text(),

    ...timestamps,
  }),
  (t) => [
    foreignKey({
      columns: [t.organizationId, t.categorySlug],
      foreignColumns: [
        transaction_category_table.organizationId,
        transaction_category_table.slug,
      ],
      name: "transactions_split_category_slug_organization_id_fkey",
    }),
    index("transaction_splits_transaction_id_idx").using(
      "btree",
      t.transactionId.asc().nullsLast().op("uuid_ops"),
    ),
  ],
);

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
      t.transactionId.asc().nullsLast().op("uuid_ops"),
    ),
    index("transaction_embeddings_organization_id_idx").using(
      "btree",
      t.organizationId.asc().nullsLast().op("uuid_ops"),
    ),
    // Vector similarity index for fast cosine similarity searches
    index("transaction_embeddings_vector_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops"),
    ),
    unique("transaction_embeddings_unique").on(t.transactionId),
  ],
);

export const transaction_category_table = pgTable(
  "transaction_category_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    // FK
    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),

    parentId: d.uuid(),
    name: d.varchar({ length: 64 }).notNull(),
    slug: d.varchar({ length: 64 }).notNull(),
    color: d.varchar({ length: 32 }),
    icon: d.varchar({ length: 32 }),
    description: d.text(),
    excluded: d.boolean().default(false),
    system: d.boolean().default(false),

    ...timestamps,
  }),
  (t) => [
    index("transaction_categories_organization_id_idx").using(
      "btree",
      t.organizationId.asc().nullsLast().op("uuid_ops"),
    ),
    index("transaction_categories_parent_id_idx").using(
      "btree",
      t.parentId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [t.parentId],
      foreignColumns: [t.id],
      name: "transaction_categories_parent_id_fkey",
    }).onDelete("set null"),
    unique("unique_organization_slug").on(t.slug, t.organizationId),
  ],
);

export const transaction_category_embeddings_table = pgTable(
  "transaction_category_embeddings_table",
  (d) => ({
    name: d.text().primaryKey().notNull(), // Unique by name - same embedding for all organizations
    embedding: d.vector({ dimensions: 768 }),
    model: d.text().notNull().default("gemini-embedding-001"),
    system: d.boolean().default(false).notNull(), // Whether this comes from system categories

    ...timestamps,
  }),
  (t) => [
    // Vector similarity index for fast cosine similarity search
    index("transaction_category_embeddings_vector_idx")
      .using("hnsw", t.embedding.asc().nullsLast().op("vector_cosine_ops"))
      .with({ m: "16", ef_construction: "64" }),
    // System categories index for filtering
    index("transaction_category_embeddings_system_idx").using(
      "btree",
      t.system.asc().nullsLast(),
    ),
  ],
);

export const transaction_attachment_table = pgTable(
  "transaction_attachment_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    transactionId: d
      .uuid()
      .references(() => transaction_table.id, { onDelete: "cascade" }),

    path: d.text().array(),
    name: d.text(),
    type: d.text(), // MIME type
    size: d.bigint({ mode: "number" }), // number

    ...timestamps,
  }),
  (t) => [
    index("transaction_attachments_organization_id_idx").using(
      "btree",
      t.organizationId.asc().nullsLast().op("uuid_ops"),
    ),
    index("transaction_attachments_transaction_id_idx").using(
      "btree",
      t.transactionId.asc().nullsLast().op("uuid_ops"),
    ),
  ],
);

// Tags Table (for multi-label categorization)
export const tag_table = pgTable(
  "tag_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    name: d.text().notNull(),

    ...timestamps,
  }),
  (t) => [unique().on(t.organizationId, t.name)],
);

// Many-to-Many Relationship: Transactions ↔ Tags
export const transaction_to_tag_table = pgTable(
  "transaction_to_tag_table",
  (d) => ({
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

// Types
export type DB_TransactionType = typeof transaction_table.$inferSelect;
export type DB_TransactionInsertType = typeof transaction_table.$inferInsert;
export type DB_TransactionSplitType =
  typeof transaction_split_table.$inferSelect;
export type DB_TransactionSplitInsertType =
  typeof transaction_split_table.$inferInsert;
export type DB_TransactionEmbeddingsType =
  typeof transaction_embeddings_table.$inferSelect;
export type DB_TransactionEmbeddingsInsertType =
  typeof transaction_embeddings_table.$inferInsert;
export type DB_TransactionCategoryType =
  typeof transaction_category_table.$inferSelect;
export type DB_TransactionCategoryInsertType =
  typeof transaction_category_table.$inferInsert;
export type DB_TagType = typeof tag_table.$inferSelect;
export type DB_TagInsertType = typeof tag_table.$inferInsert;
export type DB_TransactionToTagType =
  typeof transaction_to_tag_table.$inferSelect;
export type DB_TransactionToTagInsertType =
  typeof transaction_to_tag_table.$inferInsert;
export type DB_TransactionAttachmentType =
  typeof transaction_attachment_table.$inferSelect;
export type DB_TransactionAttachmentInsertType =
  typeof transaction_attachment_table.$inferInsert;
