import type { UIChatMessage } from "../main-agent";
import { extractTextContent } from "./extract-text-content";

const MIN_CONTEXT_LENGTH = 10;

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
