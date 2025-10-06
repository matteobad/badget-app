import type { useI18n } from "~/shared/locales/client";

type UseI18nReturn = ReturnType<typeof useI18n>;

interface NotificationUser {
  locale?: string | null;
  dateFormat?: string | null;
}

interface NotificationMetadata {
  [key: string]: unknown;
}

export function getNotificationDescription(
  _activityType: string,
  _metadata: NotificationMetadata,
  _user: NotificationUser | undefined,
  t: UseI18nReturn,
): string {
  return t("notifications.default.title");
}
