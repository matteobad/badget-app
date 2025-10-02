import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "../error-fallback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  NotificationSettings,
  NotificationSettingsSkeleton,
} from "./notification-settings";

export async function NotificationsSettingsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Manage your personal notification settings for this space.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<NotificationSettingsSkeleton />}>
            <NotificationSettings />
          </Suspense>
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}
