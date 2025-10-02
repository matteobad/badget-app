import type { Metadata } from "next";
import { Suspense } from "react";
import { NotificationsSettingsList } from "~/components/notifications/notifications-settings-list";

export const metadata: Metadata = {
  title: "Notifications | Badget",
};

export default async function Notifications() {
  return (
    <Suspense>
      <NotificationsSettingsList />
    </Suspense>
  );
}
