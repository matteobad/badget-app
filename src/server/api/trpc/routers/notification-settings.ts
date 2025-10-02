import {
  bulkUpdateNotificationSettings,
  getNotificationSettings,
  getUserNotificationPreferences,
  upsertNotificationSetting,
} from "~/server/services/notification-settings-service";
import {
  bulkUpdateNotificationSettingsSchema,
  getNotificationSettingsSchema,
  updateNotificationSettingSchema,
} from "~/shared/validators/notification-settings.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const notificationSettingsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getNotificationSettingsSchema.optional())
    .query(async ({ ctx: { db, session, orgId }, input = {} }) => {
      return getNotificationSettings(db, input, orgId!, session!.userId);
    }),

  // Get all notification types with their current settings for the user
  getAll: protectedProcedure.query(async ({ ctx: { db, session, orgId } }) => {
    return getUserNotificationPreferences(db, orgId!, session!.userId);
  }),

  // Update a single notification setting
  update: protectedProcedure
    .input(updateNotificationSettingSchema)
    .mutation(async ({ ctx: { db, session, orgId }, input }) => {
      return upsertNotificationSetting(db, input, orgId!, session!.userId);
    }),

  // Bulk update multiple notification settings
  bulkUpdate: protectedProcedure
    .input(bulkUpdateNotificationSettingsSchema)
    .mutation(async ({ ctx: { db, session, orgId }, input }) => {
      return bulkUpdateNotificationSettings(db, input, orgId!, session!.userId);
    }),
});
