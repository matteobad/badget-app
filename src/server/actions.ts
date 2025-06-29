"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { authActionClient } from "~/lib/safe-action";
import { sendToTelegram } from "~/lib/telegram";
import { FeedbackSchema, ToggleAccountSchema } from "~/lib/validators";
import { MUTATIONS } from "~/server/db/queries";
import { addYears } from "date-fns";

import type { VisibilityState } from "@tanstack/react-table";

export const toggleAccountAction = authActionClient
  .schema(ToggleAccountSchema)
  .metadata({ actionName: "toggle-account" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await MUTATIONS.toggleAccount({ ...parsedInput, userId: ctx.userId });

    // Invalidate cache
    revalidateTag(`connection_${ctx.userId}`);
    revalidateTag(`account_${ctx.userId}`);

    // Return success message
    return { message: "Account toggled" };
  });

// Server action to submit feedback
export const submitFeedbackAction = authActionClient
  .schema(FeedbackSchema)
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
