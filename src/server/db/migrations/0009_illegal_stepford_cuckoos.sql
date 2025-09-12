ALTER TABLE "badget_transaction_category_table" RENAME COLUMN "exclude_from_analytics" TO "excluded";--> statement-breakpoint
ALTER TABLE "badget_transaction_category_table" DROP CONSTRAINT "badget_transaction_category_table_parent_id_badget_transaction_category_table_id_fk";
--> statement-breakpoint
ALTER TABLE "badget_transaction_split_table" DROP CONSTRAINT "badget_transaction_split_table_category_id_badget_transaction_category_table_id_fk";
--> statement-breakpoint
ALTER TABLE "badget_transaction_table" DROP CONSTRAINT "badget_transaction_table_category_id_badget_transaction_category_table_id_fk";
--> statement-breakpoint
DROP INDEX "transaction_embeddings_team_id_idx";--> statement-breakpoint
DROP INDEX "transaction_splits_category_id_idx";--> statement-breakpoint
ALTER TABLE "badget_transaction_split_table" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "badget_transaction_split_table" ADD COLUMN "category_slug" text;--> statement-breakpoint
ALTER TABLE "badget_transaction_category_table" ADD CONSTRAINT "transaction_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."badget_transaction_category_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_split_table" ADD CONSTRAINT "badget_transaction_split_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_split_table" ADD CONSTRAINT "transactions_split_category_slug_organization_id_fkey" FOREIGN KEY ("organization_id","category_slug") REFERENCES "public"."badget_transaction_category_table"("organization_id","slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_table" ADD CONSTRAINT "transactions_category_slug_organization_id_fkey" FOREIGN KEY ("organization_id","category_slug") REFERENCES "public"."badget_transaction_category_table"("organization_id","slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transaction_categories_organization_id_idx" ON "badget_transaction_category_table" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "transaction_categories_parent_id_idx" ON "badget_transaction_category_table" USING btree ("parent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "transaction_embeddings_organization_id_idx" ON "badget_transaction_embeddings_table" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
ALTER TABLE "badget_transaction_split_table" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "badget_transaction_table" DROP COLUMN "category_id";