import { GlobeIcon, LockIcon, TriangleAlertIcon, UserIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChangeEmail } from "~/components/auth/account/change-email";
import { DeleteAccount } from "~/components/auth/account/danger/delete-account";
import { ChangeTimezone } from "~/components/auth/account/date-and-locale/change-timezone";
import { DateFormatSettings } from "~/components/auth/account/date-and-locale/date-format-settings";
import { LocaleSettings } from "~/components/auth/account/date-and-locale/locale-settings";
import { TimeFormatSettings } from "~/components/auth/account/date-and-locale/time-format-settings";
import { DisplayName } from "~/components/auth/account/display-name";
import { PasskeyManagement } from "~/components/auth/account/security/passkey-management";
import { SessionManagement } from "~/components/auth/account/security/session-managment";
import { TwoFactor } from "~/components/auth/account/security/two-factor";
import { UpdatePassword } from "~/components/auth/account/security/update-password";
import { UserAvatar } from "~/components/auth/account/user-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { auth } from "~/shared/helpers/better-auth/auth";
import { getQueryClient, trpc } from "~/shared/helpers/trpc/server";
import { getScopedI18n } from "~/shared/locales/server";

export const metadata: Metadata = {
  title: "Account | Badget",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return redirect("/sign-in");

  const t = await getScopedI18n("account");

  const queryClient = getQueryClient();
  queryClient.prefetchQuery(trpc.user.me.queryOptions());

  const [sessions, passkeys] = await Promise.all([
    auth.api.listSessions({ headers: await headers() }),
    auth.api.listPasskeys({ headers: await headers() }),
  ]);

  return (
    <Tabs className="space-y-2" defaultValue="profile">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">
          <UserIcon size={16} aria-hidden="true" />
          <span className="max-sm:hidden">{t("profile")}</span>
        </TabsTrigger>
        <TabsTrigger value="date_and_locale">
          <GlobeIcon size={16} aria-hidden="true" />
          <span className="max-sm:hidden">{t("date_and_locale")}</span>
        </TabsTrigger>
        <TabsTrigger value="security">
          <LockIcon size={16} aria-hidden="true" />
          <span className="max-sm:hidden">{t("security")}</span>
        </TabsTrigger>
        <TabsTrigger value="danger">
          <TriangleAlertIcon size={16} aria-hidden="true" />
          <span className="max-sm:hidden">{t("danger")}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <UserAvatar />
        <DisplayName />
        <ChangeEmail />
      </TabsContent>
      <TabsContent value="date_and_locale" className="space-y-4">
        <LocaleSettings />
        <ChangeTimezone />
        <TimeFormatSettings />
        <DateFormatSettings />
      </TabsContent>
      <TabsContent value="security" className="space-y-4">
        <UpdatePassword />
        <TwoFactor />
        <PasskeyManagement passkeys={passkeys} />
        <SessionManagement
          sessions={sessions}
          currentSession={session.session}
        />
      </TabsContent>
      <TabsContent value="danger">
        <DeleteAccount />
      </TabsContent>
    </Tabs>
  );
}
