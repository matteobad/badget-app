import type { UIChatMessage } from "../main-agent";

/**
 * Extracts and combines all text content from an array of chat messages
 * @param messages Array of chat messages
 * @returns Combined text content from all messages
 */
export function extractTextContent(messages: UIChatMessage[]): string {
  return messages
    .map((msg) => {
      const textPart = msg.parts?.find((part: any) => part.type === "text");
      return (textPart as any)?.text ?? "";
    })
    .join(" ")
    .trim();
}
