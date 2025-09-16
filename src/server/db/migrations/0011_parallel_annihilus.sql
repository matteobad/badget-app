CREATE TYPE "public"."document_processing_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "badget_document_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"owner_id" uuid,
	"name" text,
	"metadata" jsonb,
	"path_tokens" text[],
	"parent_id" text,
	"object_id" uuid,
	"tag" text,
	"title" text,
	"body" text,
	"fts" "tsvector" GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((title || ' '::text) || body))) STORED NOT NULL,
	"summary" text,
	"content" text,
	"date" date,
	"language" text,
	"processing_status" "document_processing_status" DEFAULT 'pending',
	"fts_simple" "tsvector",
	"fts_english" "tsvector",
	"fts_language" "tsvector",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "badget_document_tag_assignment_table" (
	"document_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	CONSTRAINT "document_tag_assignments_pkey" PRIMARY KEY("document_id","tag_id"),
	CONSTRAINT "document_tag_assignments_unique" UNIQUE("document_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "badget_document_tag_embeddings_table" (
	"slug" text PRIMARY KEY NOT NULL,
	"embedding" vector(768),
	"name" text NOT NULL,
	"model" text DEFAULT 'gemini-embedding-001' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badget_document_tag_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "unique_slug_per_organization" UNIQUE("slug","organization_id")
);
--> statement-breakpoint
ALTER TABLE "badget_document_table" ADD CONSTRAINT "badget_document_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_document_table" ADD CONSTRAINT "badget_document_table_owner_id_badget_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."badget_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_document_tag_assignment_table" ADD CONSTRAINT "badget_document_tag_assignment_table_document_id_badget_document_table_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."badget_document_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_document_tag_assignment_table" ADD CONSTRAINT "badget_document_tag_assignment_table_tag_id_badget_document_tag_table_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."badget_document_tag_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_document_tag_assignment_table" ADD CONSTRAINT "badget_document_tag_assignment_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_document_tag_table" ADD CONSTRAINT "badget_document_tag_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "documents_name_idx" ON "badget_document_table" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "documents_organization_id_idx" ON "badget_document_table" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "documents_organization_id_parent_id_idx" ON "badget_document_table" USING btree ("organization_id" uuid_ops,"parent_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_documents_fts_english" ON "badget_document_table" USING gin ("fts_english" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_documents_fts_language" ON "badget_document_table" USING gin ("fts_language" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_documents_fts_simple" ON "badget_document_table" USING gin ("fts_simple" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_document_tag_assignments_document_id" ON "badget_document_tag_assignment_table" USING btree ("document_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_document_tag_assignments_tag_id" ON "badget_document_tag_assignment_table" USING btree ("tag_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "document_tag_embeddings_idx" ON "badget_document_tag_embeddings_table" USING hnsw ("embedding" vector_cosine_ops) WITH (m=16,ef_construction=64);