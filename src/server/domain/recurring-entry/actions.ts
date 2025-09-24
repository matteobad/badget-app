"use server";

import { cookies } from "next/headers";
import { authActionClient } from "~/lib/safe-action";
import { Cookies } from "~/shared/constants/cookies";
import { addYears } from "date-fns";
import { z } from "zod";

export const setWeeklyCalendarAction = authActionClient
  .inputSchema(z.boolean())
  .metadata({ actionName: "set-weekly-calendar-action" })
  .action(async ({ parsedInput: value }) => {
    (await cookies()).set({
      name: Cookies.WeeklyCalendar,
      value: value ? "true" : "false",
      expires: addYears(new Date(), 1),
    });

    return value;
  });
