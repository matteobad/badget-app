import type {
  bulkUpdateNotificationSettingsSchema,
  getNotificationSettingsSchema,
  updateNotificationSettingSchema,
} from "~/shared/validators/notification-settings.schema";
import type z from "zod";

import type { DBClient } from "../db";
import {
  bulkUpdateNotificationSettingsMutation,
  getNotificationSettingsQuery,
  getUserNotificationPreferencesQuery,
  upsertNotificationSettingMutation,
} from "../domain/notification/notification-settings-queries";

export async function getNotificationSettings(
  db: DBClient,
  params: z.infer<typeof getNotificationSettingsSchema>,
  organizationId: string,
  userId: string,
) {
  return await getNotificationSettingsQuery(db, {
    ...params,
    organizationId,
    userId,
  });
}

export async function getUserNotificationPreferences(
  db: DBClient,
  organizationId: string,
  userId: string,
) {
  return await getUserNotificationPreferencesQuery(db, {
    organizationId,
    userId,
  });
}

export async function upsertNotificationSetting(
  db: DBClient,
  params: z.infer<typeof updateNotificationSettingSchema>,
  organizationId: string,
  userId: string,
) {
  return await upsertNotificationSettingMutation(db, {
    ...params,
    organizationId,
    userId,
  });
}

export async function bulkUpdateNotificationSettings(
  db: DBClient,
  params: z.infer<typeof bulkUpdateNotificationSettingsSchema>,
  organizationId: string,
  userId: string,
) {
  return await bulkUpdateNotificationSettingsMutation(db, {
    ...params,
    organizationId,
    userId,
  });
}
