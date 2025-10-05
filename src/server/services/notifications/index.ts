import type { DBClient } from "~/server/db";
import { createActivity } from "~/server/domain/activity/queries";
import { shouldSendNotification } from "~/server/domain/notification-settings/queries";

import type {
  EmailInput,
  NotificationOptions,
  NotificationResult,
  UserData,
} from "./base";
import type { NotificationTypes } from "./schemas";
import { getSpaceById } from "../better-auth-service";
import { transactionsExported } from "./handlers/transactions-exported";
import { createActivitySchema } from "./schemas";
import { EmailService } from "./services/email-service";

const handlers = {
  transactions_exported: transactionsExported,
} as const;

type SpaceMemeber = NonNullable<
  Awaited<ReturnType<typeof getSpaceById>>
>["members"][number];

type SpaceInfo = Omit<
  NonNullable<Awaited<ReturnType<typeof getSpaceById>>>,
  "members"
>;

export class Notifications {
  #emailService: EmailService;

  constructor(private db: DBClient) {
    this.#emailService = new EmailService(db);
  }

  #toUserData(
    spaceMembers: SpaceMemeber[],
    organizationId: string,
    spaceInfo: SpaceInfo,
  ): UserData[] {
    return spaceMembers.map((member) => ({
      id: member.id,
      full_name: member.user.name ?? undefined,
      avatar_url: member.user.image ?? undefined,
      email: member.user.email ?? "",
      locale: "en",
      organization_id: organizationId,
      role: member.role ?? "member",
    }));
  }

  async #createActivities<T extends keyof NotificationTypes>(
    handler: any,
    validatedData: NotificationTypes[T],
    groupId: string,
    notificationType: string,
    options?: NotificationOptions,
  ) {
    const activityPromises = await Promise.all(
      validatedData.users.map(async (user) => {
        const activityInput = handler.createActivity(validatedData, user);

        // Check if user wants in-app notifications for this type
        const inAppEnabled = await shouldSendNotification(
          this.db,
          user.id,
          user.organization_id,
          notificationType,
          "in_app",
        );

        // Apply priority logic based on notification preferences
        let finalPriority = activityInput.priority;

        // Runtime priority override takes precedence
        if (options?.priority !== undefined) {
          finalPriority = options.priority;
        } else if (!inAppEnabled) {
          // If in-app notifications are disabled, set to low priority (7-10 range)
          // so it's not visible in the notification center
          finalPriority = Math.max(7, activityInput.priority + 4);
          finalPriority = Math.min(10, finalPriority); // Cap at 10
        }

        activityInput.priority = finalPriority;
        activityInput.groupId = groupId;

        // Validate with Zod schema
        const validatedActivity = createActivitySchema.parse(activityInput);

        // Create activity directly using DB query
        return createActivity(this.db, validatedActivity);
      }),
    );

    return activityPromises.filter(Boolean);
  }

  #createEmailInput<T extends keyof NotificationTypes>(
    handler: any,
    validatedData: NotificationTypes[T],
    user: UserData,
    teamContext: { id: string; name: string },
    options?: NotificationOptions,
  ): EmailInput {
    // Create email input using handler's createEmail function
    const customEmail = handler.createEmail(validatedData, user, teamContext);

    const baseEmailInput: EmailInput = {
      user,
      ...customEmail,
    };

    // Apply runtime options (highest priority)
    // Extract non-email options first
    const { priority, sendEmail, ...resendOptions } = options || {};
    if (Object.keys(resendOptions).length > 0) {
      Object.assign(baseEmailInput, resendOptions);
    }

    return baseEmailInput;
  }

  async create<T extends keyof NotificationTypes>(
    type: T,
    organizationId: string,
    payload: Omit<NotificationTypes[T], "users">,
    options?: NotificationOptions,
  ): Promise<NotificationResult> {
    const space = await getSpaceById(organizationId);

    if (!space) {
      throw new Error(`Space not found: ${organizationId}`);
    }

    const { members, ...spaceInfo } = space;

    if (members.length === 0) {
      return {
        type: type as string,
        activities: 0,
        emails: { sent: 0, skipped: 0, failed: 0 },
      };
    }

    // Transform team members to UserData format
    const users = this.#toUserData(members, organizationId, spaceInfo);

    // Build the full notification data
    const data = { ...payload, users } as NotificationTypes[T];

    return this.#createInternal(type, data, options, spaceInfo);
  }

  /**
   * Internal method that handles the actual notification creation and delivery logic
   */
  async #createInternal<T extends keyof NotificationTypes>(
    type: T,
    data: NotificationTypes[T],
    options?: NotificationOptions,
    spaceInfo?: SpaceInfo,
  ): Promise<NotificationResult> {
    const handler = handlers[type];

    if (!handler) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    try {
      // Validate input data with the handler's schema
      const validatedData = handler.schema.parse(data);

      // Generate a single group ID for all related activities
      const groupId = crypto.randomUUID();

      // Create activities for each user
      const activities = await this.#createActivities(
        handler,
        validatedData,
        groupId,
        type as string,
        options,
      );

      // CONDITIONALLY send emails
      let emails = {
        sent: 0,
        skipped: validatedData.users.length,
        failed: 0,
      };

      const sendEmail = options?.sendEmail ?? false;

      // Send emails if requested and handler supports email
      if (sendEmail && handler.createEmail) {
        const firstUser = validatedData.users[0];
        if (!firstUser) {
          throw new Error("No team members available for email context");
        }

        // Check the email type to determine behavior
        const teamContext = {
          id: spaceInfo?.id ?? "",
          name: spaceInfo?.name ?? "Space",
        };
        const sampleEmail = handler.createEmail(
          validatedData,
          firstUser,
          teamContext,
        );

        if (sampleEmail.emailType === "user") {
          // Customer-facing email: send regardless of team preferences
          const emailInputs = [
            this.#createEmailInput(
              handler,
              validatedData,
              firstUser,
              teamContext,
              options,
            ),
          ];

          emails = await this.#emailService.sendBulk(
            emailInputs,
            type as string,
          );

          console.log("📨 Email result for customer:", {
            sent: emails.sent,
            skipped: emails.skipped,
            failed: emails.failed || 0,
          });
        } else if (sampleEmail.emailType === "owners") {
          // Owners-only email: send to team owners only
          const ownerUsers = validatedData.users.filter(
            (user: UserData) => user.role === "owner",
          );

          const emailInputs = ownerUsers.map((user: UserData) =>
            this.#createEmailInput(
              handler,
              validatedData,
              user,
              teamContext,
              options,
            ),
          );

          console.log("📨 Email inputs for owners:", emailInputs.length);

          emails = await this.#emailService.sendBulk(
            emailInputs,
            type as string,
          );

          console.log("📨 Email result for owners:", {
            sent: emails.sent,
            skipped: emails.skipped,
            failed: emails.failed || 0,
          });
        } else {
          // Team-facing email: send to all team members
          const emailInputs = validatedData.users.map((user: UserData) =>
            this.#createEmailInput(
              handler,
              validatedData,
              user,
              teamContext,
              options,
            ),
          );

          console.log("📨 Email inputs for team:", emailInputs.length);

          emails = await this.#emailService.sendBulk(
            emailInputs,
            type as string,
          );

          console.log("📨 Email result for team:", {
            sent: emails.sent,
            skipped: emails.skipped,
            failed: emails.failed || 0,
          });
        }
      }

      return {
        type: type as string,
        activities: activities.length,
        emails,
      };
    } catch (error) {
      console.error(`Failed to send notification ${type}:`, error);
      throw error;
    }
  }
}
