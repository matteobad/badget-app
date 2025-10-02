import { index, unique } from "drizzle-orm/pg-core";

import { pgTable } from "./_table";
import { organization, user } from "./auth";

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

    notificationType: d.text("notification_type").notNull(),
    channel: d.text("channel").notNull(), // 'in_app', 'email', 'push'
    enabled: d.boolean().default(true).notNull(),

    createdAt: d
      .timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: d
      .timestamp("updated_at", { withTimezone: true, mode: "string" })
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
