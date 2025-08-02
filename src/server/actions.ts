"use server";

import { cookies } from "next/headers";
import { authActionClient } from "~/lib/safe-action";
import { sendToTelegram } from "~/lib/telegram";
import { FeedbackSchema } from "~/lib/validators";
import { addYears } from "date-fns";

import type { VisibilityState } from "@tanstack/react-table";

// Server action to submit feedback
export const submitFeedbackAction = authActionClient
  .inputSchema(FeedbackSchema)
  .metadata({ actionName: "submit-feedback" })
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { message, category } = parsedInput;

      // Format the message for Telegram
      const formattedMessage = `
      <b>New Feedback</b>
      <b>Category:</b> ${category}
      <b>User:</b> ${ctx.userId}
      <b>Time:</b> ${new Date().toISOString()}
      <b>Message:</b> ${message}`;

      // Send to Telegram
      await sendToTelegram(formattedMessage);

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
