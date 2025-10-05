import {
  getActivities,
  updateActivityStatus,
  updateAllActivitiesStatus,
} from "~/server/domain/activity/queries";
import {
  getNotificationsSchema,
  updateAllNotificationsStatusSchema,
  updateNotificationStatusSchema,
} from "~/shared/validators/notifications.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const notificationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(getNotificationsSchema.optional())
    .query(async ({ ctx: { orgId, db, session }, input }) => {
      return getActivities(db, {
        organizationId: orgId!,
        userId: session!.userId,
        ...input,
      });
    }),

  updateStatus: protectedProcedure
    .input(updateNotificationStatusSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return updateActivityStatus(db, input.activityId, input.status, orgId!);
    }),

  updateAllStatus: protectedProcedure
    .input(updateAllNotificationsStatusSchema)
    .mutation(async ({ ctx: { db, orgId, session }, input }) => {
      return updateAllActivitiesStatus(db, orgId!, input.status, {
        userId: session!.userId,
      });
    }),
});
