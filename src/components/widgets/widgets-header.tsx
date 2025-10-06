"use client";

import { useCallback, useEffect, useState } from "react";
import { TZDate } from "@date-fns/tz";
import { useUserQuery } from "~/hooks/use-user";
import { useScopedI18n } from "~/shared/locales/client";

import { ChatHistory } from "../chat/chat-history";
import { Customize } from "./customize";
import { useIsCustomizing } from "./widget-provider";

export function WidgetsHeader() {
  const t = useScopedI18n("widgets.header");

  const { data: user } = useUserQuery();
  const isCustomizing = useIsCustomizing();

  const getTimeBasedGreeting = useCallback(
    (timezone?: string): string => {
      const userTimezone =
        timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new TZDate(new Date(), userTimezone);
      const hour = now.getHours();

      if (hour >= 5 && hour < 12) {
        return t("greetings.morning");
      }
      if (hour >= 12 && hour < 17) {
        return t("greetings.aftenoon");
      }
      if (hour >= 17 && hour < 21) {
        return t("greetings.evening");
      }

      return t("greetings.night");
    },
    [t],
  );

  const [greeting, setGreeting] = useState(() =>
    getTimeBasedGreeting(user?.timezone ?? undefined),
  );

  useEffect(() => {
    // Update greeting immediately when user timezone changes
    setGreeting(getTimeBasedGreeting(user?.timezone ?? undefined));

    // Set up interval to update greeting every 5 minutes
    // This ensures the greeting changes naturally as time passes
    const interval = setInterval(
      () => {
        const newGreeting = getTimeBasedGreeting(user?.timezone ?? undefined);
        setGreeting(newGreeting);
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.timezone, getTimeBasedGreeting]);

  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="mb-1 font-serif text-[30px] leading-normal">
          <span>{greeting} </span>
          <span className="text-muted-foreground">
            {user?.name?.split(" ")[0]},
          </span>
        </h1>
        <p className="text-[14px] text-muted-foreground">
          {isCustomizing ? t("message_customize") : t("message_default")}
        </p>
      </div>

      <div className="flex items-center space-x-4" data-no-close>
        <Customize />
        <ChatHistory />
      </div>
    </div>
  );
}
