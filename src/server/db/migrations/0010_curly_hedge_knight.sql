CREATE TABLE "badget_transaction_attachment_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"transaction_id" uuid,
	"path" text[],
	"name" text,
	"type" text,
	"size" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
DROP TABLE "badget_attachment_table" CASCADE;--> statement-breakpoint
ALTER TABLE "badget_transaction_attachment_table" ADD CONSTRAINT "badget_transaction_attachment_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_attachment_table" ADD CONSTRAINT "badget_transaction_attachment_table_transaction_id_badget_transaction_table_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."badget_transaction_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transaction_attachments_organization_id_idx" ON "badget_transaction_attachment_table" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "transaction_attachments_transaction_id_idx" ON "badget_transaction_attachment_table" USING btree ("transaction_id" uuid_ops);