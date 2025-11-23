ALTER TABLE "badget_passkey" RENAME COLUMN "credential_i_d" TO "credential_id";--> statement-breakpoint
ALTER TABLE "badget_account" ALTER COLUMN "id" SET DEFAULT pg_catalog.gen_random_uuid();--> statement-breakpoint
ALTER TABLE "badget_account" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "badget_invitation" ALTER COLUMN "id" SET DEFAULT pg_catalog.gen_random_uuid();--> statement-breakpoint
ALTER TABLE "badget_member" ALTER COLUMN "id" SET DEFAULT pg_catalog.gen_random_uuid();--> statement-breakpoint
ALTER TABLE "badget_organization" ALTER COLUMN "id" SET DEFAULT pg_catalog.gen_random_uuid();--> statement-breakpoint
ALTER TABLE "badget_passkey" ALTER COLUMN "id" SET DEFAULT pg_catalog.gen_random_uuid();--> statement-breakpoint
ALTER TABLE "badget_session" ALTER COLUMN "id" SET DEFAULT pg_catalog.gen_random_uuid();--> statement-breakpoint
ALTER TABLE "badget_session" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "badget_two_factor" ALTER COLUMN "id" SET DEFAULT pg_catalog.gen_random_uuid();--> statement-breakpoint
ALTER TABLE "badget_user" ALTER COLUMN "id" SET DEFAULT pg_catalog.gen_random_uuid();--> statement-breakpoint
ALTER TABLE "badget_user" ALTER COLUMN "email_verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "badget_user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "badget_user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "badget_user" ALTER COLUMN "banned" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "badget_user" ALTER COLUMN "two_factor_enabled" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "badget_verification" ALTER COLUMN "id" SET DEFAULT pg_catalog.gen_random_uuid();--> statement-breakpoint
ALTER TABLE "badget_verification" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "badget_verification" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "badget_verification" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "badget_verification" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "badget_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "badget_invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitation_organization_id_idx" ON "badget_invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_user_id_idx" ON "badget_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "member_organization_id_idx" ON "badget_member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_slug_idx" ON "badget_organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "passkey_user_id_idx" ON "badget_passkey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_credential_id_idx" ON "badget_passkey" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "badget_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "badget_session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "two_factor_secret_idx" ON "badget_two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_user_id_idx" ON "badget_two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "badget_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "badget_verification" USING btree ("identifier");