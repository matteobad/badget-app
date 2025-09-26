CREATE TABLE "badget_chat_feedback_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" text NOT NULL,
	"message_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badget_chat_message_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badget_chat_table" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "badget_chat_feedback_table" ADD CONSTRAINT "badget_chat_feedback_table_chat_id_badget_chat_table_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."badget_chat_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_chat_feedback_table" ADD CONSTRAINT "badget_chat_feedback_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_chat_feedback_table" ADD CONSTRAINT "badget_chat_feedback_table_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_chat_message_table" ADD CONSTRAINT "badget_chat_message_table_chat_id_badget_chat_table_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."badget_chat_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_chat_message_table" ADD CONSTRAINT "badget_chat_message_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_chat_message_table" ADD CONSTRAINT "badget_chat_message_table_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_chat_table" ADD CONSTRAINT "badget_chat_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_chat_table" ADD CONSTRAINT "badget_chat_table_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_feedback_chat_id_idx" ON "badget_chat_feedback_table" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "chat_feedback_message_id_idx" ON "badget_chat_feedback_table" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "chat_feedback_organization_id_idx" ON "badget_chat_feedback_table" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "chat_feedback_user_id_idx" ON "badget_chat_feedback_table" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_feedback_type_idx" ON "badget_chat_feedback_table" USING btree ("type");--> statement-breakpoint
CREATE INDEX "chat_feedback_created_at_idx" ON "badget_chat_feedback_table" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chat_messages_chat_id_idx" ON "badget_chat_message_table" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "chat_messages_organization_id_idx" ON "badget_chat_message_table" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "chat_messages_user_id_idx" ON "badget_chat_message_table" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_messages_created_at_idx" ON "badget_chat_message_table" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chats_organization_id_idx" ON "badget_chat_table" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "chats_user_id_idx" ON "badget_chat_table" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chats_updated_at_idx" ON "badget_chat_table" USING btree ("updated_at");