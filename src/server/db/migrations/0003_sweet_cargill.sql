ALTER TABLE "badget_transaction_table" ADD COLUMN "merchant_name" text;--> statement-breakpoint
ALTER TABLE "badget_transaction_table" ADD COLUMN "enrichment_completed" boolean DEFAULT false;