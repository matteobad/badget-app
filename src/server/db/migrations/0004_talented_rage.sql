ALTER TABLE "badget_account_table" ALTER COLUMN "type" SET DATA TYPE text USING type::text;--> statement-breakpoint
ALTER TABLE "badget_account_table" ALTER COLUMN "type" SET DEFAULT 'asset';--> statement-breakpoint
ALTER TABLE "badget_account_table" ADD COLUMN "subtype" text;--> statement-breakpoint
DROP TYPE "public"."account_type";--> statement-breakpoint
CREATE TYPE "public"."account_type" AS ENUM('asset', 'liability');--> statement-breakpoint
CREATE TYPE "public"."account_subtype" AS ENUM('cash', 'checking', 'savings', 'investment', 'property', 'credit_card', 'loan', 'mortgage', 'other_liability');--> statement-breakpoint
CREATE INDEX "bank_accounts_bank_connection_id_idx" ON "badget_account_table" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "bank_accounts_organization_id_idx" ON "badget_account_table" USING btree ("organization_id");