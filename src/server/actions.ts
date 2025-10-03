"use server";

import { cookies } from "next/headers";
import { actionClient, authActionClient } from "~/lib/safe-action";
import { Cookies } from "~/shared/constants/cookies";
import { sendSupportSchema } from "~/shared/validators/support.schema";
import { addYears } from "date-fns";
import { z } from "zod";

import type { VisibilityState } from "@tanstack/react-table";
import { resend } from "../lib/resend";

export const trackingConsentAction = actionClient
  .inputSchema(z.boolean())
  .metadata({ actionName: "tracking-consent" })
  .action(async ({ parsedInput: value }) => {
    (await cookies()).set({
      name: Cookies.TrackingConsent,
      value: value ? "1" : "0",
      expires: addYears(new Date(), 1),
    });

    return value;
  });

// Server action to submit feedback
export const submitFeedbackAction = authActionClient
  .inputSchema(sendSupportSchema)
  .metadata({ actionName: "submit-feedback" })
  .action(async ({ parsedInput }) => {
    try {
      const { message, email, subject, type, priority } = parsedInput;

      await resend.emails.send({
        from: "Badget <support@resend.dev>",
        cc: [email],
        to: "matteo.badini95@gmail.com", // TODO: use admin email
        subject: `Support [${type}] [${priority}]- ${subject}`,
        text: message,
      });

      return { success: true };
    } catch (error) {
      console.error("Error sending feedback:", error);
      return {
        success: false,
        error: "Failed to send feedback. Please try again.",
      };
    }
  });

type Props = {
  key: string;
  data: VisibilityState;
};

export async function updateColumnVisibilityAction({ key, data }: Props) {
  (await cookies()).set(key, JSON.stringify(data), {
    expires: addYears(new Date(), 1),
  });

  return Promise.resolve(data);
}
