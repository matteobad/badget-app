CREATE TYPE "public"."activity_source" AS ENUM('system', 'user');--> statement-breakpoint
CREATE TYPE "public"."activity_status" AS ENUM('unread', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('transactions_enriched', 'transactions_created', 'document_uploaded', 'document_processed', 'transactions_categorized', 'transactions_assigned', 'transaction_attachment_created', 'transaction_category_created', 'transactions_exported');--> statement-breakpoint
CREATE TABLE "badget_activity_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"type" "activity_type" NOT NULL,
	"priority" smallint DEFAULT 5,
	"group_id" uuid,
	"source" "activity_source" NOT NULL,
	"metadata" jsonb NOT NULL,
	"status" "activity_status" DEFAULT 'unread' NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "badget_organization_preferences_table" CASCADE;--> statement-breakpoint
DROP TABLE "badget_user_preferences_table" CASCADE;--> statement-breakpoint
ALTER TABLE "badget_activity_table" ADD CONSTRAINT "badget_activity_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_activity_table" ADD CONSTRAINT "badget_activity_table_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_notifications_idx" ON "badget_activity_table" USING btree ("organization_id","priority","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "activities_insights_idx" ON "badget_activity_table" USING btree ("organization_id","type","source","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "activities_metadata_gin_idx" ON "badget_activity_table" USING gin ("metadata");--> statement-breakpoint
CREATE INDEX "activities_group_id_idx" ON "badget_activity_table" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "activities_insights_group_idx" ON "badget_activity_table" USING btree ("organization_id","group_id","type","created_at" DESC NULLS LAST);