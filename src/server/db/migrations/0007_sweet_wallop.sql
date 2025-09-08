ALTER TABLE "badget_rule_table" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "badget_token_table" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "badget_rule_table" CASCADE;--> statement-breakpoint
DROP TABLE "badget_token_table" CASCADE;--> statement-breakpoint
ALTER TABLE "badget_category_table" RENAME TO "badget_transaction_category_table";--> statement-breakpoint
ALTER TABLE "badget_transaction_category_table" DROP CONSTRAINT "badget_category_table_organization_id_badget_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "badget_transaction_category_table" DROP CONSTRAINT "badget_category_table_parent_id_badget_category_table_id_fk";
--> statement-breakpoint
ALTER TABLE "badget_transaction_split_table" DROP CONSTRAINT "badget_transaction_split_table_category_id_badget_category_table_id_fk";
--> statement-breakpoint
ALTER TABLE "badget_transaction_table" DROP CONSTRAINT "badget_transaction_table_category_id_badget_category_table_id_fk";
--> statement-breakpoint
ALTER TABLE "badget_transaction_category_table" ADD CONSTRAINT "badget_transaction_category_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_category_table" ADD CONSTRAINT "badget_transaction_category_table_parent_id_badget_transaction_category_table_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."badget_transaction_category_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_split_table" ADD CONSTRAINT "badget_transaction_split_table_category_id_badget_transaction_category_table_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."badget_transaction_category_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_table" ADD CONSTRAINT "badget_transaction_table_category_id_badget_transaction_category_table_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."badget_transaction_category_table"("id") ON DELETE set null ON UPDATE no action;