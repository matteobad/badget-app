CREATE TYPE "public"."account_type" AS ENUM('checking', 'savings', 'cash', 'ewallet', 'credit_card', 'loan', 'mortgage', 'other_debt', 'etf', 'stock', 'bond', 'brokerage', 'pension', 'crypto', 'real_estate', 'vehicle', 'other_asset', 'other');--> statement-breakpoint
CREATE TYPE "public"."recurrence" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."bank_provider" AS ENUM('enablebanking', 'gocardless', 'plaid', 'teller');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('connected', 'disconnected', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."transaction_frequency" AS ENUM('weekly', 'biweekly', 'monthly', 'semi_monthly', 'annually', 'irregular', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."transaction_method" AS ENUM('payment', 'card_purchase', 'card_atm', 'transfer', 'other', 'unknown', 'ach', 'interest', 'deposit', 'wire', 'fee');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('posted', 'pending', 'excluded', 'completed', 'archived');--> statement-breakpoint
CREATE TABLE "badget_account_balance_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"account_id" uuid,
	"date" date NOT NULL,
	"balance" numeric(10, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "badget_account_balance_table_accountId_date_unique" UNIQUE("account_id","date")
);
--> statement-breakpoint
CREATE TABLE "badget_account_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"institution_id" uuid,
	"connection_id" uuid,
	"raw_id" text,
	"name" varchar(64) NOT NULL,
	"description" text,
	"type" "account_type" NOT NULL,
	"logo_url" varchar(2048),
	"balance" numeric(10, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"manual" boolean DEFAULT false NOT NULL,
	"error_details" text,
	"error_retries" smallint,
	"account_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "badget_account_table_rawId_unique" UNIQUE("raw_id"),
	CONSTRAINT "badget_account_table_organizationId_rawId_unique" UNIQUE("organization_id","raw_id")
);
--> statement-breakpoint
CREATE TABLE "badget_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badget_invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badget_member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badget_organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "badget_organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "badget_passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_i_d" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp,
	"aaguid" text
);
--> statement-breakpoint
CREATE TABLE "badget_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text,
	CONSTRAINT "badget_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "badget_two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badget_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	"two_factor_enabled" boolean,
	"username" text,
	"display_username" text,
	CONSTRAINT "badget_user_email_unique" UNIQUE("email"),
	CONSTRAINT "badget_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "badget_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "badget_budget_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"validity" "tstzrange",
	"recurrence" "recurrence",
	"recurrence_end" timestamp,
	"override_for_budget_id" uuid,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "badget_category_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"parent_id" uuid,
	"type" text NOT NULL,
	"name" varchar(64) NOT NULL,
	"slug" varchar(64) NOT NULL,
	"color" varchar(32),
	"icon" varchar(32),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "unique_organization_slug" UNIQUE("slug","organization_id")
);
--> statement-breakpoint
CREATE TABLE "badget_rule_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "badget_token_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"rule_id" varchar(128) NOT NULL,
	"token" text NOT NULL,
	"relevance" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "badget_connection_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"institution_id" uuid NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"provider" "bank_provider" NOT NULL,
	"reference_id" varchar,
	"status" "connection_status" DEFAULT 'connected',
	"error_details" text,
	"error_retries" smallint DEFAULT '0',
	"expires_at" timestamp with time zone,
	"last_accessed" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "badget_connection_table_referenceId_unique" UNIQUE("reference_id"),
	CONSTRAINT "unique_bank_connections" UNIQUE("institution_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "badget_institution_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_id" varchar(128) NOT NULL,
	"name" varchar(256) NOT NULL,
	"logo" varchar(2048),
	"provider" "bank_provider" NOT NULL,
	"available_history" integer,
	"popularity" integer DEFAULT 0,
	"countries" text[] DEFAULT ARRAY[]::text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "badget_institution_table_originalId_unique" UNIQUE("original_id")
);
--> statement-breakpoint
CREATE TABLE "badget_attachment_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"transaction_id" uuid,
	"file_name" text NOT NULL,
	"file_key" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "badget_tag_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "badget_tag_table_organizationId_text_unique" UNIQUE("organization_id","text")
);
--> statement-breakpoint
CREATE TABLE "badget_transaction_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"account_id" uuid NOT NULL,
	"category_id" uuid,
	"raw_id" text,
	"amount" numeric(10, 2) NOT NULL,
	"currency" char(3) NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"manual" boolean DEFAULT false,
	"notified" boolean DEFAULT false,
	"internal" boolean DEFAULT false,
	"category_slug" text,
	"counterparty_name" text,
	"method" "transaction_method" NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL,
	"frequency" "transaction_frequency",
	"status" "transaction_status" DEFAULT 'posted' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "badget_transaction_table_rawId_unique" UNIQUE("raw_id"),
	CONSTRAINT "badget_transaction_table_organizationId_rawId_unique" UNIQUE("organization_id","raw_id")
);
--> statement-breakpoint
CREATE TABLE "badget_transaction_to_tag_table" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"transaction_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "badget_transaction_to_tag_table_transactionId_tagId_unique" UNIQUE("transaction_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "badget_account_balance_table" ADD CONSTRAINT "badget_account_balance_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_account_balance_table" ADD CONSTRAINT "badget_account_balance_table_account_id_badget_account_table_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."badget_account_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_account_table" ADD CONSTRAINT "badget_account_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_account_table" ADD CONSTRAINT "badget_account_table_institution_id_badget_institution_table_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."badget_institution_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_account_table" ADD CONSTRAINT "badget_account_table_connection_id_badget_connection_table_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."badget_connection_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_account" ADD CONSTRAINT "badget_account_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_invitation" ADD CONSTRAINT "badget_invitation_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_invitation" ADD CONSTRAINT "badget_invitation_inviter_id_badget_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_member" ADD CONSTRAINT "badget_member_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_member" ADD CONSTRAINT "badget_member_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_passkey" ADD CONSTRAINT "badget_passkey_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_session" ADD CONSTRAINT "badget_session_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_two_factor" ADD CONSTRAINT "badget_two_factor_user_id_badget_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."badget_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_budget_table" ADD CONSTRAINT "badget_budget_table_category_id_badget_category_table_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."badget_category_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_budget_table" ADD CONSTRAINT "badget_budget_table_override_for_budget_id_badget_budget_table_id_fk" FOREIGN KEY ("override_for_budget_id") REFERENCES "public"."badget_budget_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_category_table" ADD CONSTRAINT "badget_category_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_category_table" ADD CONSTRAINT "badget_category_table_parent_id_badget_category_table_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."badget_category_table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_rule_table" ADD CONSTRAINT "badget_rule_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_rule_table" ADD CONSTRAINT "badget_rule_table_category_id_badget_category_table_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."badget_category_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_token_table" ADD CONSTRAINT "badget_token_table_rule_id_badget_rule_table_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."badget_rule_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_connection_table" ADD CONSTRAINT "badget_connection_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_connection_table" ADD CONSTRAINT "badget_connection_table_institution_id_badget_institution_table_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."badget_institution_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_attachment_table" ADD CONSTRAINT "badget_attachment_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_attachment_table" ADD CONSTRAINT "badget_attachment_table_transaction_id_badget_transaction_table_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."badget_transaction_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_tag_table" ADD CONSTRAINT "badget_tag_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_table" ADD CONSTRAINT "badget_transaction_table_organization_id_badget_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."badget_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_table" ADD CONSTRAINT "badget_transaction_table_account_id_badget_account_table_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."badget_account_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_table" ADD CONSTRAINT "badget_transaction_table_category_id_badget_category_table_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."badget_category_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_to_tag_table" ADD CONSTRAINT "badget_transaction_to_tag_table_transaction_id_badget_transaction_table_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."badget_transaction_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badget_transaction_to_tag_table" ADD CONSTRAINT "badget_transaction_to_tag_table_tag_id_badget_tag_table_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."badget_tag_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "badget_rule_table_organization_id_index" ON "badget_rule_table" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "badget_token_table_rule_id_token_index" ON "badget_token_table" USING btree ("rule_id","token");