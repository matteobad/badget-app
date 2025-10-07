import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const followupQuestionsSchema = z.object({
  questions: z
    .array(z.string())
    .max(4)
    .describe("Array of 2-4 contextual follow-up questions"),
});

/**
 * Generate follow-up questions based on tool output and available tools
 */
export async function generateFollowupQuestions(
  toolName: string,
  toolDescription: string,
  toolOutput: string,
): Promise<string[]> {
  try {
    const result = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: followupQuestionsSchema,
      temperature: 0.7,
      system: `
        You are a financial assistant generating follow-up questions for Badget, a personal finance platform.

        Based on the tool output provided, generate 2-4 contextual follow-up questions that would be natural next steps. Each question should be:
        - Short and actionable (max 8-10 words)
        - Specific to the data and insights shown in the tool output
        - Something that would provide deeper analysis or related insights
        - Answerable with available tools in the system

        Examples of good follow-up questions:
        - "Break down by category"
        - "Compare with last month"
        - "Show weekly trend"
        - "Check against my budget"
        - "View recurring expenses"
        - "Analyze savings progress"
        - "Compare accounts"
        - "Drill into groceries spending"
        - "Show balance changes over time"
        - "Highlight overspending areas"

        Avoid business-oriented terms like "quarter", "department", "revenue", "cost reduction".

        Tool name: ${toolName}
        Tool description: ${toolDescription}
      `,
      prompt: `Based on this tool output, generate relevant follow-up questions that would naturally extend the analysis:

      Tool Output:
      ${toolOutput.slice(0, 2000)} ${toolOutput.length > 2000 ? "..." : ""}

      Generate questions that would help the user dive deeper into this specific data or explore related financial insights.`,
    });

    return result.object.questions;
  } catch (error) {
    console.error("Failed to generate follow-up questions:", error);
    return [];
  }
}
