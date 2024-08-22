"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export async function findMatchingCategory(
  prompt: string,
  categories: string[],
) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    system: `You are an AI assistant specialized in categorizing financial transactions.
               Your task is to analyze the given transaction list and match it to the most appropriate category from the provided list.
               Only use categories from the list provided. If no category seems to fit, respond with 'Uncategorized'.
               Consider common financial terms, merchant names, and transaction patterns in your analysis.
               Categories: ${categories.join(",")}
               Transaction format: id,accountId,amount,currency,date,description
               Transaction seprator: ';'
      `,
    schema: z.object({
      transaction: z.array(
        z.object({
          id: z
            .string()
            .describe("The transaction id for the matched category"),
          category: z
            .string()
            .describe("The category name that matches the prompt"),
        }),
      ),
    }),
    prompt,
    temperature: 0.5,
  });

  return { object };
}
