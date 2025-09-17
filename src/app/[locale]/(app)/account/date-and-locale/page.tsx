import type { Metadata } from "next";
import { ChangeTimezone } from "~/components/account-settings/date-and-locale/change-timezone";
import { DateFormatSettings } from "~/components/account-settings/date-and-locale/date-format-settings";
import { LocaleSettings } from "~/components/account-settings/date-and-locale/locale-settings";
import { TimeFormatSettings } from "~/components/account-settings/date-and-locale/time-format-settings";

export const metadata: Metadata = {
  title: "Date & Locale | Badget",
};

export default async function Page() {
  return (
    <div className="space-y-12">
      <LocaleSettings />
      <ChangeTimezone />
      <TimeFormatSettings />
      <DateFormatSettings />
    </div>
  );
}
