import type { DBClient } from "~/server/db";
import { notification_settings_table } from "~/server/db/schema/notifications";
import { and, eq } from "drizzle-orm";

import { getUserSettingsNotificationTypes } from "./notification-types";

export type NotificationChannel = "in_app" | "email" | "push";

export interface NotificationSetting {
  id: string;
  userId: string;
  organizationId: string;
  notificationType: string;
  channel: NotificationChannel;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertNotificationSettingParams {
  userId: string;
  organizationId: string;
  notificationType: string;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface GetNotificationSettingsParams {
  userId: string;
  organizationId: string;
  notificationType?: string;
  channel?: NotificationChannel;
}

export async function getNotificationSettingsQuery(
  db: DBClient,
  params: GetNotificationSettingsParams,
): Promise<NotificationSetting[]> {
  const conditions = [
    eq(notification_settings_table.userId, params.userId),
    eq(notification_settings_table.organizationId, params.organizationId),
  ];

  if (params.notificationType) {
    conditions.push(
      eq(notification_settings_table.notificationType, params.notificationType),
    );
  }

  if (params.channel) {
    conditions.push(eq(notification_settings_table.channel, params.channel));
  }

  const results = await db
    .select()
    .from(notification_settings_table)
    .where(and(...conditions));

  return results.map((result) => ({
    ...result,
    channel: result.channel as NotificationChannel,
  }));
}

export async function upsertNotificationSettingMutation(
  db: DBClient,
  params: UpsertNotificationSettingParams,
): Promise<NotificationSetting> {
  const [result] = await db
    .insert(notification_settings_table)
    .values({
      userId: params.userId,
      organizationId: params.organizationId,
      notificationType: params.notificationType,
      channel: params.channel,
      enabled: params.enabled,
    })
    .onConflictDoUpdate({
      target: [
        notification_settings_table.userId,
        notification_settings_table.organizationId,
        notification_settings_table.notificationType,
        notification_settings_table.channel,
      ],
      set: {
        enabled: params.enabled,
        updatedAt: new Date().toISOString(),
      },
    })
    .returning();

  if (!result) {
    throw new Error("Failed to upsert notification setting");
  }

  return {
    ...result,
    channel: result.channel as NotificationChannel,
  };
}

// Helper to check if a specific notification should be sent
export async function shouldSendNotification(
  db: DBClient,
  userId: string,
  organizationId: string,
  notificationType: string,
  channel: NotificationChannel,
): Promise<boolean> {
  const settings = await getNotificationSettingsQuery(db, {
    userId,
    organizationId,
    notificationType,
    channel,
  });

  // If no setting exists, default to enabled
  if (settings.length === 0) {
    return true;
  }

  return settings[0]?.enabled ?? true;
}

type GetUserNotificationPreferencesParams = {
  organizationId: string;
  userId: string;
};

// Get all notification types with their current settings for a user
// Note: This only returns the backend data (type, channels, settings)
// Frontend should handle name/description via i18n
export async function getUserNotificationPreferencesQuery(
  db: DBClient,
  params: GetUserNotificationPreferencesParams,
): Promise<
  {
    type: string;
    channels: NotificationChannel[];
    settings: { channel: NotificationChannel; enabled: boolean }[];
    category?: string;
    order?: number;
  }[]
> {
  const { organizationId, userId } = params;
  const userSettings = await getNotificationSettingsQuery(db, {
    userId,
    organizationId,
  });

  // Get notification types that should appear in user settings
  const notificationTypes = getUserSettingsNotificationTypes();

  return notificationTypes.map((notificationType) => ({
    type: notificationType.type,
    channels: notificationType.channels,
    category: notificationType.category,
    order: notificationType.order,
    settings: notificationType.channels.map((channel) => {
      const setting = userSettings.find(
        (s) =>
          s.notificationType === notificationType.type && s.channel === channel,
      );
      return {
        channel,
        enabled: setting?.enabled ?? true, // Default to enabled if no setting exists
      };
    }),
  }));
}

type BulkUpdateNotificationSettingsParams = {
  userId: string;
  organizationId: string;
  updates: {
    notificationType: string;
    channel: NotificationChannel;
    enabled: boolean;
  }[];
};

// Bulk update multiple notification settings
export async function bulkUpdateNotificationSettingsMutation(
  db: DBClient,
  params: BulkUpdateNotificationSettingsParams,
): Promise<NotificationSetting[]> {
  const { organizationId, userId, updates } = params;
  const results = await Promise.all(
    updates.map((update) =>
      upsertNotificationSettingMutation(db, {
        userId,
        organizationId,
        ...update,
      }),
    ),
  );

  return results;
}
