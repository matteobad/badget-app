"use client";

import { formatDistanceToNow } from "date-fns";
import { ArchiveIcon, BellIcon, ReceiptIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Activity } from "~/hooks/use-notifications";
import { getMetadata, getMetadataProperty } from "~/hooks/use-notifications";
import { useUserQuery } from "~/hooks/use-user";
import { cn } from "~/lib/utils";
import { useI18n } from "~/shared/locales/client";

import { getNotificationDescription } from "./notification-descriptions";
import { NotificationLink } from "./notification-link";

interface NotificationItemProps {
  id: string;
  setOpen: (open: boolean) => void;
  activity: Activity;
  markMessageAsRead?: (id: string) => void;
}

export function NotificationItem({
  id,
  setOpen,
  activity,
  markMessageAsRead,
}: NotificationItemProps) {
  const t = useI18n();
  const { data: user } = useUserQuery();

  const recordId = getMetadataProperty(activity, "recordId");
  const metadata = getMetadata(activity);

  const getNotificationIcon = (activityType: string) => {
    if (activityType.startsWith("transaction"))
      return <ReceiptIcon className="size-4" />;
    return <BellIcon className="size-4" />;
  };

  const description = getNotificationDescription(
    activity.type,
    metadata,
    user,
    t,
  );

  const notificationContent = (
    <>
      <div>
        <div className="flex h-9 w-9 items-center justify-center space-y-0 rounded-full border">
          {getNotificationIcon(activity.type)}
        </div>
      </div>
      <div>
        <p
          className={cn(
            "text-sm",
            activity.status === "unread" && "font-medium",
          )}
        >
          {description}
        </p>
        <span className="text-xs text-[#606060]">
          {t("notifications.time_ago", {
            time: formatDistanceToNow(new Date(activity.createdAt)),
          })}
        </span>
      </div>
    </>
  );

  const actionButton = markMessageAsRead && (
    <div>
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full bg-transparent hover:bg-[#F6F6F3] dark:hover:bg-[#1A1A1A]"
        onClick={() => markMessageAsRead(id)}
        title={t("notifications.archive_button")}
      >
        <ArchiveIcon />
      </Button>
    </div>
  );

  return (
    <NotificationLink
      activityType={activity.type}
      recordId={recordId}
      metadata={metadata}
      onNavigate={() => setOpen(false)}
      className="items-between flex flex-1 space-x-4 text-left"
      actionButton={actionButton}
    >
      {notificationContent}
    </NotificationLink>
  );
}
