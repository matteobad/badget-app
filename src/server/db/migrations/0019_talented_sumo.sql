CREATE TABLE "badget_user_preferences_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"widgets" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "badget_user_preferences_table" ADD CONSTRAINT "badget_user_preferences_table_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_user_preferences_table" ADD CONSTRAINT "badget_user_preferences_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_dashboard_preferences_user_id_organization_id_unqidx" ON "badget_user_preferences_table" USING btree ("user_id","organization_id");