"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTransactionParams } from "~/hooks/use-transaction-params";

const SUPPORTED_NOTIFICATION_TYPES = ["transactions_created"];

export function isNotificationClickable(activityType: string): boolean {
  return SUPPORTED_NOTIFICATION_TYPES.includes(activityType);
}

interface NotificationLinkProps {
  activityType: string;
  recordId: string | null | undefined;
  metadata?: Record<string, any>;
  onNavigate?: () => void;
  children: ReactNode;
  className?: string;
  actionButton?: ReactNode;
}

export function NotificationLink({
  activityType,
  recordId,
  metadata,
  onNavigate,
  children,
  className,
  actionButton,
}: NotificationLinkProps) {
  const { setParams: setTransactionParams } = useTransactionParams();
  const router = useRouter();

  const isClickable = isNotificationClickable(activityType);

  const handleClick = () => {
    onNavigate?.();

    try {
      switch (activityType) {
        case "transactions_created":
          if (metadata?.recordId) {
            void setTransactionParams({ transactionId: recordId! });
          } else if (metadata?.dateRange) {
            router.push(
              `/transactions?start=${metadata.dateRange.from}&end=${metadata.dateRange.to}`,
            );
          }
          break;

        default:
          console.warn(`Unhandled notification type: ${activityType}`);
      }
    } catch (error) {
      console.error(`Error navigating for ${activityType}:`, error);
    }
  };

  if (isClickable) {
    return (
      <div className="items-between flex justify-between space-x-4 px-3 py-3 hover:bg-secondary">
        <button className={className} onClick={handleClick} type="button">
          {children}
        </button>
        {actionButton}
      </div>
    );
  }

  // Non-clickable notification
  return (
    <div className="items-between flex space-x-4 px-3 py-3">
      <div className="items-between flex flex-1 justify-between space-x-4">
        {children}
      </div>
      {actionButton}
    </div>
  );
}
