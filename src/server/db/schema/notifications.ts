import { index, pgEnum, unique } from "drizzle-orm/pg-core";

import { pgTable } from "./_table";
import { organization, user } from "./auth";

export const activityTypeEnum = pgEnum("activity_type", [
  // System-generated activities
  "transactions_enriched",
  "transactions_created",

  // User actions
  "document_uploaded",
  "document_processed",
  "transactions_categorized",
  "transactions_assigned",
  "transaction_attachment_created",
  "transaction_category_created",
  "transactions_exported",
]);

export const activitySourceEnum = pgEnum("activity_source", [
  "system", // Automated system processes
  "user", // Direct user actions
]);

export const activityStatusEnum = pgEnum("activity_status", [
  "unread",
  "read",
  "archived",
]);

export const activity_table = pgTable(
  "activity_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    userId: d.uuid().references(() => user.id, {
      onDelete: "cascade",
    }),

    type: activityTypeEnum().notNull(),
    priority: d.smallint().default(5), // 1-3 = notifications, 4-10 = insights only
    groupId: d.uuid("group_id"), // Group related activities together (e.g., same business event across multiple users)
    source: activitySourceEnum().notNull(), // Source of the activity
    metadata: d.jsonb().notNull(), // All the data
    status: activityStatusEnum().default("unread").notNull(), // Simple lifecycle (only for notifications)
    // Timestamp of last system use (e.g. insight generation, digest inclusion)
    lastUsedAt: d.timestamp({
      withTimezone: true,
      mode: "string",
    }),

    createdAt: d
      .timestamp({ withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }),
  (t) => [
    // Optimized indexes
    index("activities_notifications_idx").using(
      "btree",
      t.organizationId,
      t.priority,
      t.status,
      t.createdAt.desc(),
    ),
    index("activities_insights_idx").using(
      "btree",
      t.organizationId,
      t.type,
      t.source,
      t.createdAt.desc(),
    ),
    index("activities_metadata_gin_idx").using("gin", t.metadata),
    index("activities_group_id_idx").on(t.groupId),
    index("activities_insights_group_idx").using(
      "btree",
      t.organizationId,
      t.groupId,
      t.type,
      t.createdAt.desc(),
    ),
  ],
);

export const notification_settings_table = pgTable(
  "notification_settings_table",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey().notNull(),

    organizationId: d
      .uuid()
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    userId: d
      .uuid()
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    notificationType: d.text().notNull(),
    channel: d.text().notNull(), // 'in_app', 'email', 'push'
    enabled: d.boolean().default(true).notNull(),

    createdAt: d
      .timestamp({ withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }),
  (t) => [
    unique("notification_settings_user_organization_type_channel_key").on(
      t.userId,
      t.organizationId,
      t.notificationType,
      t.channel,
    ),
    index("notification_settings_user_organization_idx").on(
      t.userId,
      t.organizationId,
    ),
    index("notification_settings_type_channel_idx").on(
      t.notificationType,
      t.channel,
    ),
  ],
);
