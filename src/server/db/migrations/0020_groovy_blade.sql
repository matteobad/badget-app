CREATE TABLE "badget_notification_settings_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_type" text NOT NULL,
	"channel" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_settings_user_organization_type_channel_key" UNIQUE("user_id","organization_id","notification_type","channel")
);
--> statement-breakpoint
ALTER TABLE "badget_organization" ADD COLUMN "export_settings" jsonb;--> statement-breakpoint
ALTER TABLE "badget_notification_settings_table" ADD CONSTRAINT "badget_notification_settings_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_notification_settings_table" ADD CONSTRAINT "badget_notification_settings_table_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_settings_user_organization_idx" ON "badget_notification_settings_table" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "notification_settings_type_channel_idx" ON "badget_notification_settings_table" USING btree ("notification_type","channel");