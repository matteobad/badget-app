import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { unauthorized } from "next/navigation";
import { auth } from "~/shared/helpers/better-auth/auth";
import { generateTransactionFiltersSchema } from "~/shared/validators/transaction.schema";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  // If no session exists, return a 401 and render unauthorized.tsx
  if (!session) {
    unauthorized();
  }

  const { prompt, context } = (await req.json()) as {
    prompt: string;
    context: string;
  };

  const result = streamObject({
    model: google("gemini-2.5-flash-lite"),
    system: `You are a helpful assistant that generates filters for a given prompt. \n
             Current date is: ${new Date().toISOString().split("T")[0]} \n
             ${context}
    `,
    schema: generateTransactionFiltersSchema,
    prompt,
  });

  return result.toTextStreamResponse();
}
