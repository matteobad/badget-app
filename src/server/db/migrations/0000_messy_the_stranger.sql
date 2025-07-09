CREATE TYPE "public"."recurrence" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."transaction_frequency" AS ENUM('weekly', 'biweekly', 'monthly', 'semi_monthly', 'annually', 'irregular', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('booked', 'pending', 'excluded', 'archived');--> statement-breakpoint
CREATE TABLE "badget_account_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"institution_id" varchar(128),
	"connection_id" varchar(128),
	"raw_id" text,
	"name" varchar(64) NOT NULL,
	"description" text,
	"type" text DEFAULT 'checking' NOT NULL,
	"logo_url" varchar(2048),
	"balance" numeric(10, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"manual" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "badget_account_table_rawId_unique" UNIQUE("raw_id"),
	CONSTRAINT "badget_account_table_userId_rawId_unique" UNIQUE("user_id","raw_id")
);
--> statement-breakpoint
CREATE TABLE "badget_budget_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"user_id" varchar(32),
	"validity" "tstzrange",
	"recurrence" "recurrence",
	"recurrence_end" timestamp,
	"override_for_budget_id" uuid,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "badget_category_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(32),
	"parent_id" uuid,
	"type" text NOT NULL,
	"name" varchar(64) NOT NULL,
	"slug" varchar(64) NOT NULL,
	"color" varchar(32),
	"icon" varchar(32),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "badget_category_table_slug_userId_unique" UNIQUE("slug","user_id")
);
--> statement-breakpoint
CREATE TABLE "badget_rule_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "badget_token_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"rule_id" varchar(128) NOT NULL,
	"token" text NOT NULL,
	"relevance" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "badget_connection_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"institution_id" varchar(128) NOT NULL,
	"reference_id" varchar,
	"provider" text NOT NULL,
	"status" text DEFAULT 'unknown',
	"valid_until" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "badget_connection_table_referenceId_unique" UNIQUE("reference_id")
);
--> statement-breakpoint
CREATE TABLE "badget_institution_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"original_id" varchar(128) NOT NULL,
	"name" varchar(256) NOT NULL,
	"logo" varchar(2048),
	"provider" text NOT NULL,
	"available_history" integer,
	"popularity" integer DEFAULT 0,
	"countries" text[] DEFAULT ARRAY[]::text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "badget_institution_table_originalId_unique" UNIQUE("original_id")
);
--> statement-breakpoint
CREATE TABLE "badget_attachment_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"transaction_id" varchar(128),
	"file_name" text NOT NULL,
	"file_key" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "badget_tag_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "badget_tag_table_userId_text_unique" UNIQUE("user_id","text")
);
--> statement-breakpoint
CREATE TABLE "badget_transaction_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"account_id" varchar(128) NOT NULL,
	"category_id" uuid,
	"raw_id" text,
	"amount" numeric(10, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"description" text NOT NULL,
	"manual" boolean DEFAULT false,
	"category_slug" text,
	"counterparty_name" text,
	"exclude" boolean DEFAULT false NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL,
	"frequency" "transaction_frequency",
	"status" "transaction_status" DEFAULT 'booked',
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "badget_transaction_table_rawId_unique" UNIQUE("raw_id"),
	CONSTRAINT "badget_transaction_table_userId_rawId_unique" UNIQUE("user_id","raw_id")
);
--> statement-breakpoint
CREATE TABLE "badget_transaction_to_tag_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"transaction_id" varchar(128) NOT NULL,
	"tag_id" varchar(128) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "badget_transaction_to_tag_table_transactionId_tagId_unique" UNIQUE("transaction_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "badget_account_table" ADD CONSTRAINT "badget_account_table_institution_id_badget_institution_table_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."badget_institution_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_account_table" ADD CONSTRAINT "badget_account_table_connection_id_badget_connection_table_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."badget_connection_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_budget_table" ADD CONSTRAINT "badget_budget_table_category_id_badget_category_table_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."badget_category_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_budget_table" ADD CONSTRAINT "badget_budget_table_override_for_budget_id_badget_budget_table_id_fk" FOREIGN KEY ("override_for_budget_id") REFERENCES "public"."badget_budget_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_category_table" ADD CONSTRAINT "badget_category_table_parent_id_badget_category_table_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."badget_category_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_rule_table" ADD CONSTRAINT "badget_rule_table_category_id_badget_category_table_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."badget_category_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_token_table" ADD CONSTRAINT "badget_token_table_rule_id_badget_rule_table_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."badget_rule_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_connection_table" ADD CONSTRAINT "badget_connection_table_institution_id_badget_institution_table_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."badget_institution_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_attachment_table" ADD CONSTRAINT "badget_attachment_table_transaction_id_badget_transaction_table_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."badget_transaction_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_table" ADD CONSTRAINT "badget_transaction_table_account_id_badget_account_table_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."badget_account_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_table" ADD CONSTRAINT "badget_transaction_table_category_id_badget_category_table_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."badget_category_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_to_tag_table" ADD CONSTRAINT "badget_transaction_to_tag_table_transaction_id_badget_transaction_table_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."badget_transaction_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_to_tag_table" ADD CONSTRAINT "badget_transaction_to_tag_table_tag_id_badget_tag_table_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."badget_tag_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "badget_rule_table_user_id_index" ON "badget_rule_table" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "badget_token_table_rule_id_token_index" ON "badget_token_table" USING btree ("rule_id","token");