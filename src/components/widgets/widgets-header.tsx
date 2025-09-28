"use client";

import { useEffect, useState } from "react";
import { TZDate } from "@date-fns/tz";
import { useUserQuery } from "~/hooks/use-user";

import { ChatHistory } from "../chat/chat-history";
import { Customize } from "./customize";

function getTimeBasedGreeting(timezone?: string): string {
  const userTimezone =
    timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new TZDate(new Date(), userTimezone);
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return "Morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "Evening";
  }

  return "Night";
}

export function WidgetsHeader() {
  const { data: user } = useUserQuery();

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
  }, [user?.timezone]);

  return (
    <div className="flex items-center justify-between pt-6">
      <div>
        <h1 className="mb-1 font-serif text-[30px] leading-normal">
          <span>{greeting} </span>
          <span className="text-muted-foreground">
            {user?.name?.split(" ")[0]},
          </span>
        </h1>
        <p className="text-[14px] text-muted-foreground">
          here&apos;s a quick look at how things are going.
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <Customize />
        <ChatHistory />
      </div>
    </div>
  );
}
