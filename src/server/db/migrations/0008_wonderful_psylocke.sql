ALTER TABLE "badget_transaction_table" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
CREATE INDEX "idx_transactions_date" ON "badget_transaction_table" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_transactions_organization_id_date_name" ON "badget_transaction_table" USING btree ("organization_id","date","name");--> statement-breakpoint
CREATE INDEX "idx_transactions_organization_id_name" ON "badget_transaction_table" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "transactions_bank_account_id_idx" ON "badget_transaction_table" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "transactions_category_slug_idx" ON "badget_transaction_table" USING btree ("category_slug");--> statement-breakpoint
CREATE INDEX "transactions_organization_id_idx" ON "badget_transaction_table" USING btree ("organization_id");