import type { Metadata } from "next";
import { AccountSettings } from "~/components/account-settings/account-settings";
import { prefetch, trpc } from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Account Settings | Badget",
};

export default async function Account() {
  prefetch(trpc.user.me.queryOptions());

  return <AccountSettings />;
}
