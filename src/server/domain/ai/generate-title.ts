import type { ChatUserContext } from "~/server/chat-cache";
import { google } from "@ai-sdk/google";
import { TZDate } from "@date-fns/tz";
import { generateObject } from "ai";
import { z } from "zod";

import type { UIChatMessage } from "./types";
import { safeValue } from "./utils/safe-value";

const MIN_CONTEXT_LENGTH = 10;

type Params = Omit<ChatUserContext, "organizationId" | "userId"> & {
  message: string;
};

export const generateTitle = async ({
  message,
  organizationName,
  country,
  fullName,
  baseCurrency,
  city,
  timezone,
  countryCode,
}: Params) => {
  try {
    // If the message is too short, return "New Chat"
    if (message.length < MIN_CONTEXT_LENGTH) {
      return null;
    }

    const userTimezone = timezone || "UTC";
    const tzDate = new TZDate(new Date(), userTimezone);

    const titleResult = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: z.object({
        title: z.string().describe("The title of the chat"),
      }),
      temperature: 0.2,
      system: `
      You will generate a short, natural title based on the user's message.
      - Keep titles under 50 characters
      - Use natural, conversational language that sounds like what a user would say
      - Avoid technical jargon or formal business terms
      - Make titles simple, clear, and personal
      - Return only the title, nothing else
    
      Examples of good natural titles:
      - "Recent spending"
      - "Groceries this month"
      - "Budget check"
      - "Savings progress"
      - "My expenses today"
      - "Vacation fund"
      - "Bills overview"
      - "Monthly budget"
      - "Spending trends"
      - "Bank balances"
    
      Avoid these patterns:
      - "Advanced financial analysis"
      - "Comprehensive spending report"
      - "Detailed reconciliation overview"
      - "Sophisticated metrics"
      - "Complex financial insights"
    
      Current date and time: ${tzDate.toISOString()}
      Base currency: ${safeValue(baseCurrency)}
      User full name: ${safeValue(fullName)}
      User current city: ${safeValue(city)}
      User current country: ${safeValue(country)}
      User local timezone: ${userTimezone}
      `,
      prompt: message,
    });

    const cleanTitle = titleResult.object.title;

    return cleanTitle.slice(0, 50);
  } catch (error) {
    console.warn({
      msg: "Failed to generate chat title",
      error: error instanceof Error ? error.message : String(error),
    });

    const trimmedMessage = message.trim();

    if (trimmedMessage) {
      return trimmedMessage.slice(0, 50);
    }

    return null;
  }
};

/**
 * Extracts and combines all text content from an array of chat messages
 * @param messages Array of chat messages
 * @returns Combined text content from all messages
 */
export function extractTextContent(messages: UIChatMessage[]): string {
  return messages
    .map((msg) => {
      const textPart = msg.parts?.find((part: any) => part.type === "text");
      return (textPart as any)?.text || "";
    })
    .join(" ")
    .trim();
}

/**
 * Checks if a conversation has enough content for title generation
 * @param messages Array of chat messages
 * @param minLength Minimum length threshold (default: 20)
 * @returns True if conversation has enough content
 */
export function hasEnoughContent(
  messages: UIChatMessage[],
  minLength = MIN_CONTEXT_LENGTH,
): boolean {
  const combinedText = extractTextContent(messages);
  return combinedText.length > minLength;
}
