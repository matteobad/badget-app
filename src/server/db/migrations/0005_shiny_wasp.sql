CREATE TABLE "badget_transaction_split_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"category_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "badget_transaction_split_table" ADD CONSTRAINT "badget_transaction_split_table_transaction_id_badget_transaction_table_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."badget_transaction_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_split_table" ADD CONSTRAINT "badget_transaction_split_table_category_id_badget_category_table_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."badget_category_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transaction_splits_transaction_id_idx" ON "badget_transaction_split_table" USING btree ("transaction_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "transaction_splits_category_id_idx" ON "badget_transaction_split_table" USING btree ("category_id" uuid_ops);