ALTER TABLE "badget_user" ADD COLUMN "locale" text DEFAULT 'it-IT';--> statement-breakpoint
ALTER TABLE "badget_user" ADD COLUMN "week_starts_on_monday" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "badget_user" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "badget_user" ADD COLUMN "timezone_auto_sync" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "badget_user" ADD COLUMN "time_format" numeric DEFAULT 24;--> statement-breakpoint
ALTER TABLE "badget_user" ADD COLUMN "date_format" text;