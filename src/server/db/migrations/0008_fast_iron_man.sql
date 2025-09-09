CREATE TABLE "badget_transaction_category_embeddings_table" (
	"name" text PRIMARY KEY NOT NULL,
	"embedding" vector(768),
	"model" text DEFAULT 'gemini-embedding-001' NOT NULL,
	"system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "badget_transaction_category_table" ADD COLUMN "system" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "transaction_category_embeddings_vector_idx" ON "badget_transaction_category_embeddings_table" USING hnsw ("embedding" vector_cosine_ops) WITH (m=16,ef_construction=64);--> statement-breakpoint
CREATE INDEX "transaction_category_embeddings_system_idx" ON "badget_transaction_category_embeddings_table" USING btree ("system");--> statement-breakpoint
ALTER TABLE "badget_transaction_category_table" DROP COLUMN "type";--> statement-breakpoint
DROP TYPE "public"."category_type";