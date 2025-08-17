ALTER TYPE "public"."bank_provider" ADD VALUE 'saltedge' BEFORE 'plaid';--> statement-breakpoint
ALTER TABLE "badget_account_table" DROP CONSTRAINT "badget_account_table_rawId_unique";