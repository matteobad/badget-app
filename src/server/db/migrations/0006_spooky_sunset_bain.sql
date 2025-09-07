CREATE TABLE "badget_organization_preferences_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"base_currency" text DEFAULT 'EUR' NOT NULL,
	"timezone" text DEFAULT 'Europe/Rome' NOT NULL,
	"locale" text DEFAULT 'it-IT' NOT NULL,
	"week_start_day" integer DEFAULT 1 NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "badget_organization_preferences_table_organizationId_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
ALTER TABLE "badget_organization_preferences_table" ADD CONSTRAINT "badget_organization_preferences_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;