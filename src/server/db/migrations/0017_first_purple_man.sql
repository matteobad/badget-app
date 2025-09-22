ALTER TABLE "badget_tag_table" RENAME COLUMN "text" TO "name";--> statement-breakpoint
ALTER TABLE "badget_tag_table" DROP CONSTRAINT "badget_tag_table_organizationId_text_unique";--> statement-breakpoint
ALTER TABLE "badget_transaction_to_tag_table" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "badget_transaction_to_tag_table" ADD CONSTRAINT "badget_transaction_to_tag_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_tag_table" ADD CONSTRAINT "badget_tag_table_organizationId_name_unique" UNIQUE("organization_id","name");