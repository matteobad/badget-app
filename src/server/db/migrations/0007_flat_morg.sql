ALTER TABLE "badget_account_balance_table" DROP CONSTRAINT "badget_account_balance_table_account_id_badget_account_table_id_fk";
--> statement-breakpoint
ALTER TABLE "badget_account_balance_table" ALTER COLUMN "account_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "badget_account_balance_table" ADD CONSTRAINT "badget_account_balance_table_account_id_badget_account_table_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."badget_account_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organization_account_date_idx" ON "badget_account_balance_table" USING btree ("organization_id","account_id","date" DESC NULLS LAST);