import { boolean, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { numericCasted } from "../utils";
import { pgTable } from "./_table";

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  twoFactorEnabled: boolean("two_factor_enabled"),
  username: text("username").unique(),
  displayUsername: text("display_username"),

  // custom
  defaultOrganizationId: text("default_organization_id").notNull().default(""),
  locale: text().default("it-IT"),
  weekStartsOnMonday: boolean("week_starts_on_monday").default(false),
  timezone: text(),
  timezoneAutoSync: boolean("timezone_auto_sync").default(true),
  timeFormat: numericCasted("time_format").default(24),
  dateFormat: text("date_format"),
});

export type DB_UserType = typeof user.$inferSelect;
export type DB_UserInsertType = typeof user.$inferInsert;

export const session = pgTable("session", {
  id: uuid("id").defaultRandom().primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
  activeOrganizationId: text("active_organization_id"),
});

export const account = pgTable("account", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const passkey = pgTable("passkey", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  publicKey: text("public_key").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  credentialID: text("credential_i_d").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(),
  backedUp: boolean("backed_up").notNull(),
  transports: text("transports"),
  createdAt: timestamp("created_at"),
  aaguid: text("aaguid"),
});

export const twoFactor = pgTable("two_factor", {
  id: uuid("id").defaultRandom().primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const organization = pgTable("organization", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  baseCurrency: text("base_currency"),
  countryCode: text("country_code"),
  email: text("email"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const member = pgTable("member", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: uuid("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
