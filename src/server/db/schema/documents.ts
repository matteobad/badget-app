import type { SQL } from "drizzle-orm";
import { relations, sql } from "drizzle-orm";
import { index, pgEnum, primaryKey, unique } from "drizzle-orm/pg-core";

import { timestamps, tsvector } from "../utils";
import { pgTable } from "./_table";
import { organization as organization_table, user as user_table } from "./auth";

export const documentProcessingStatusEnum = pgEnum(
  "document_processing_status",
  ["pending", "processing", "completed", "failed"],
);

// Tables
export const document_table = pgTable(
  "document_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
    ownerId: d.uuid().references(() => user_table.id, { onDelete: "set null" }),

    name: d.text(),
    metadata: d.jsonb(),
    pathTokens: d.text("path_tokens").array(),
    parentId: d.text("parent_id"),
    objectId: d.uuid("object_id"),
    tag: d.text(),
    title: d.text(),
    body: d.text(),
    fts: tsvector("fts")
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`to_tsvector('english'::regconfig, ((title || ' '::text) || body))`,
      ),
    summary: d.text(),
    content: d.text(),
    date: d.date(),
    language: d.text(),
    processingStatus: documentProcessingStatusEnum().default("pending"),
    ftsSimple: tsvector(),
    ftsEnglish: tsvector(),
    ftsLanguage: tsvector(),

    ...timestamps,
  }),
  (t) => [
    index("documents_name_idx").using(
      "btree",
      t.name.asc().nullsLast().op("text_ops"),
    ),
    index("documents_organization_id_idx").using(
      "btree",
      t.organizationId.asc().nullsLast().op("uuid_ops"),
    ),
    index("documents_organization_id_parent_id_idx").using(
      "btree",
      t.organizationId.asc().nullsLast().op("uuid_ops"),
      t.parentId.asc().nullsLast().op("text_ops"),
    ),
    index("idx_documents_fts_english").using(
      "gin",
      t.ftsEnglish.asc().nullsLast().op("tsvector_ops"),
    ),
    index("idx_documents_fts_language").using(
      "gin",
      t.ftsLanguage.asc().nullsLast().op("tsvector_ops"),
    ),
    index("idx_documents_fts_simple").using(
      "gin",
      t.ftsSimple.asc().nullsLast().op("tsvector_ops"),
    ),
    // TODO: needs trigram extension
    // index("idx_gin_documents_title").using(
    //   "gin",
    //   t.title.asc().nullsLast().op("gin_trgm_ops"),
    // ),
  ],
);

export const document_tag_table = pgTable(
  "document_tag_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),

    name: d.text().notNull(),
    slug: d.text().notNull(),

    ...timestamps,
  }),
  (t) => [unique("unique_slug_per_organization").on(t.slug, t.organizationId)],
);

export const document_tag_embeddings_table = pgTable(
  "document_tag_embeddings_table",
  (d) => ({
    slug: d.text().primaryKey().notNull(),
    embedding: d.vector({ dimensions: 768 }),
    name: d.text().notNull(),
    model: d.text().notNull().default("gemini-embedding-001"),
  }),
  (t) => [
    index("document_tag_embeddings_idx")
      .using("hnsw", t.embedding.asc().nullsLast().op("vector_cosine_ops"))
      .with({ m: "16", ef_construction: "64" }),
  ],
);

export const document_tag_assignment_table = pgTable(
  "document_tag_assignment_table",
  (d) => ({
    documentId: d
      .uuid()
      .references(() => document_table.id, { onDelete: "cascade" })
      .notNull(),
    tagId: d
      .uuid()
      .references(() => document_tag_table.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: d
      .uuid()
      .references(() => organization_table.id, { onDelete: "cascade" })
      .notNull(),
  }),
  (table) => [
    index("idx_document_tag_assignments_document_id").using(
      "btree",
      table.documentId.asc().nullsLast().op("uuid_ops"),
    ),
    index("idx_document_tag_assignments_tag_id").using(
      "btree",
      table.tagId.asc().nullsLast().op("uuid_ops"),
    ),
    primaryKey({
      columns: [table.documentId, table.tagId],
      name: "document_tag_assignments_pkey",
    }),
    unique("document_tag_assignments_unique").on(table.documentId, table.tagId),
  ],
);

// Relations
export const documentsRelations = relations(
  document_table,
  ({ one, many }) => ({
    user: one(user_table, {
      fields: [document_table.ownerId],
      references: [user_table.id],
    }),
    organization: one(organization_table, {
      fields: [document_table.organizationId],
      references: [organization_table.id],
    }),
    documentTagAssignments: many(document_tag_assignment_table),
  }),
);

export const documentTagsRelations = relations(
  document_tag_table,
  ({ one, many }) => ({
    organization: one(organization_table, {
      fields: [document_tag_table.organizationId],
      references: [organization_table.id],
    }),
    documentTagAssignments: many(document_tag_assignment_table),
  }),
);

export const documentTagAssignmentsRelations = relations(
  document_tag_assignment_table,
  ({ one }) => ({
    document: one(document_table, {
      fields: [document_tag_assignment_table.documentId],
      references: [document_table.id],
    }),
    documentTag: one(document_tag_table, {
      fields: [document_tag_assignment_table.tagId],
      references: [document_tag_table.id],
    }),
    organization: one(organization_table, {
      fields: [document_tag_assignment_table.organizationId],
      references: [organization_table.id],
    }),
  }),
);
