// import { NotificationsSettingsList } from "@/components/notifications-settings-list";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Notifications | Badget",
};

export default async function Notifications() {
  return <Suspense>{/* <NotificationsSettingsList /> */}</Suspense>;
}
