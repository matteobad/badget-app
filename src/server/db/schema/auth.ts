import { relations, sql } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core";
import { numericCasted } from "../utils";
import { pgTable } from "./_table";

export const user = pgTable(
  "user",
  (d) => ({
    id: d.uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    updatedAt: d
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),

    name: d.text("name").notNull(),
    email: d.text("email").notNull().unique(),
    emailVerified: d.boolean("email_verified").default(false).notNull(),
    image: d.text("image"),
    twoFactorEnabled: d.boolean("two_factor_enabled").default(false),
    role: d.text("role"),
    banned: d.boolean("banned").default(false),
    banReason: d.text("ban_reason"),
    banExpires: d.timestamp("ban_expires"),
    username: d.text("username").unique(),
    displayUsername: d.text("display_username"),

    // additional fields
    defaultOrganizationId: d
      .text("default_organization_id")
      .notNull()
      .default(""),
    locale: d.text().default("it-IT"),
    weekStartsOnMonday: d.boolean("week_starts_on_monday").default(false),
    timezone: d.text(),
    timezoneAutoSync: d.boolean("timezone_auto_sync").default(true),
    timeFormat: numericCasted("time_format").default(24),
    dateFormat: d.text("date_format"),
  }),
  (t) => [index("user_email_idx").on(t.email)],
);

export const session = pgTable(
  "session",
  (d) => ({
    id: d.uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    updatedAt: d
      .timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),

    userId: d
      .uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    expiresAt: d.timestamp("expires_at").notNull(),
    token: d.text("token").notNull().unique(),
    ipAddress: d.text("ip_address"),
    userAgent: d.text("user_agent"),
    impersonatedBy: d.text("impersonated_by"),

    // additional fields
    activeOrganizationId: d.text("active_organization_id"),
  }),
  (t) => [
    index("session_user_id_idx").on(t.userId),
    index("session_token_idx").on(t.token),
  ],
);

export const account = pgTable(
  "account",
  (d) => ({
    id: d.uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    updatedAt: d
      .timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),

    userId: d
      .uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    accountId: d.text("account_id").notNull(),
    providerId: d.text("provider_id").notNull(),
    accessToken: d.text("access_token"),
    refreshToken: d.text("refresh_token"),
    idToken: d.text("id_token"),
    accessTokenExpiresAt: d.timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: d.timestamp("refresh_token_expires_at"),
    scope: d.text("scope"),
    password: d.text("password"),
  }),
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  (d) => ({
    id: d.uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    updatedAt: d
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),

    identifier: d.text("identifier").notNull(),
    value: d.text("value").notNull(),
    expiresAt: d.timestamp("expires_at").notNull(),
  }),
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const passkey = pgTable(
  "passkey",
  (d) => ({
    id: d.uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    createdAt: d.timestamp("created_at"),

    userId: d
      .uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    name: d.text("name"),
    publicKey: d.text("public_key").notNull(),
    credentialID: d.text("credential_id").notNull(),
    counter: d.integer("counter").notNull(),
    deviceType: d.text("device_type").notNull(),
    backedUp: d.boolean("backed_up").notNull(),
    transports: d.text("transports"),
    aaguid: d.text("aaguid"),
  }),
  (t) => [
    index("passkey_user_id_idx").on(t.userId),
    index("passkey_credential_id_idx").on(t.credentialID),
  ],
);

export const twoFactor = pgTable(
  "two_factor",
  (d) => ({
    id: d.uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),

    userId: d
      .uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    secret: d.text("secret").notNull(),
    backupCodes: d.text("backup_codes").notNull(),
  }),
  (t) => [
    index("two_factor_secret_idx").on(t.secret),
    index("twoFactor_user_id_idx").on(t.userId),
  ],
);

export const organization = pgTable(
  "organization",
  (d) => ({
    id: d.uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    createdAt: d.timestamp("created_at").notNull(),

    name: d.text("name").notNull(),
    slug: d.text("slug").unique(),
    logo: d.text("logo"),
    metadata: d.text("metadata"),

    // additional fields
    baseCurrency: d.text("base_currency"),
    countryCode: d.text("country_code"),
    email: d.text("email"),
    exportSettings: d.jsonb("export_settings"),
  }),
  (t) => [index("organization_slug_idx").on(t.slug)],
);

export const member = pgTable(
  "member",
  (d) => ({
    id: d.uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),
    createdAt: d.timestamp("created_at").notNull(),

    organizationId: d
      .uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: d
      .uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    role: d.text("role").default("member").notNull(),
  }),
  (t) => [
    index("member_user_id_idx").on(t.userId),
    index("member_organization_id_idx").on(t.organizationId),
  ],
);

export const invitation = pgTable(
  "invitation",
  (d) => ({
    id: d.uuid("id").default(sql`pg_catalog.gen_random_uuid()`).primaryKey(),

    inviterId: d
      .uuid("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: d
      .uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    email: d.text("email").notNull(),
    role: d.text("role"),
    status: d.text("status").default("pending").notNull(),
    expiresAt: d.timestamp("expires_at").notNull(),
  }),
  (t) => [
    index("invitation_email_idx").on(t.email),
    index("invitation_organization_id_idx").on(t.organizationId),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  passkeys: many(passkey),
  twoFactors: many(twoFactor),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export type DB_UserType = typeof user.$inferSelect;
export type DB_UserInsertType = typeof user.$inferInsert;
export type DB_SpaceType = typeof organization.$inferSelect;
export type DB_SpaceInsertType = typeof organization.$inferInsert;
