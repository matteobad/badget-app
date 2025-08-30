CREATE TABLE "badget_transaction_embeddings_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"embedding" vector(768),
	"source_text" text NOT NULL,
	"model" text DEFAULT 'gemini-embedding-001' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_embeddings_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
ALTER TABLE "badget_transaction_table" ADD COLUMN "fts_vector" "tsvector" GENERATED ALWAYS AS (
				to_tsvector(
					'english',
					(
						(COALESCE(name, ''::text) || ' '::text) || COALESCE(description, ''::text)
					)
				)
			) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "badget_transaction_embeddings_table" ADD CONSTRAINT "badget_transaction_embeddings_table_transaction_id_badget_transaction_table_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."badget_transaction_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_embeddings_table" ADD CONSTRAINT "badget_transaction_embeddings_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transaction_embeddings_transaction_id_idx" ON "badget_transaction_embeddings_table" USING btree ("transaction_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "transaction_embeddings_team_id_idx" ON "badget_transaction_embeddings_table" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "transaction_embeddings_vector_idx" ON "badget_transaction_embeddings_table" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_fts" ON "badget_transaction_table" USING gin ("fts_vector" tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_fts_vector" ON "badget_transaction_table" USING gin ("fts_vector" tsvector_ops);